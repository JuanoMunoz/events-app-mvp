/**
 * offline-db.ts
 *
 * Wrapper sobre IndexedDB nativo para la cola de asistencias offline.
 * Sin dependencias externas. Solo se ejecuta en el browser.
 *
 * Stores:
 *   - pending-attendances : registros esperando sincronización con el servidor
 *   - local-checkins      : índice local de quién ya hizo check-in (previene duplicados offline)
 */

const DB_NAME    = "eventos-offline-db"
const DB_VERSION = 1
const STORE_PENDING  = "pending-attendances"
const STORE_CHECKINS = "local-checkins"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PendingAttendance {
    id:           string   // UUID generado localmente
    queuedAt:     number   // epoch ms de cuando se encoló
    eventId:      string
    eventDayId:   string
    cedula:       string
    nombre:       string
    apellido:     string
    telefono:     string
    correo:       string
    retries:      number   // intentos fallidos de sincronización
    lastAttempt?: number   // epoch ms del último intento
}

export interface LocalCheckin {
    key:        string   // `${cedula}::${eventDayId}`
    cedula:     string
    eventDayId: string
    checkedAt:  number
}

// ─── Apertura de BD ───────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
    if (_db) return Promise.resolve(_db)

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)

        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_PENDING)) {
                db.createObjectStore(STORE_PENDING, { keyPath: "id" })
            }
            if (!db.objectStoreNames.contains(STORE_CHECKINS)) {
                db.createObjectStore(STORE_CHECKINS, { keyPath: "key" })
            }
        }

        req.onsuccess = () => {
            _db = req.result
            resolve(_db)
        }
        req.onerror = () => reject(req.error)
    })
}

// ─── Operaciones sobre pending-attendances ────────────────────────────────────

/**
 * Encola un registro de asistencia pendiente y marca el checkin local
 * en una sola transacción atómica.
 */
export async function enqueuePendingAttendance(
    data: Omit<PendingAttendance, "id" | "queuedAt" | "retries">
): Promise<string> {
    const db  = await openDB()
    const id  = crypto.randomUUID()
    const now = Date.now()

    const record: PendingAttendance = { ...data, id, queuedAt: now, retries: 0 }

    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_PENDING, STORE_CHECKINS], "readwrite")

        tx.objectStore(STORE_PENDING).put(record)

        const checkinKey = `${data.cedula}::${data.eventDayId}`
        const checkin: LocalCheckin = {
            key:        checkinKey,
            cedula:     data.cedula,
            eventDayId: data.eventDayId,
            checkedAt:  now,
        }
        tx.objectStore(STORE_CHECKINS).put(checkin)

        tx.oncomplete = () => resolve(id)
        tx.onerror    = () => reject(tx.error)
    })
}

/** Devuelve todos los registros pendientes ordenados por queuedAt ascendente. */
export async function getAllPending(): Promise<PendingAttendance[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_PENDING, "readonly")
        const req = tx.objectStore(STORE_PENDING).getAll()
        req.onsuccess = () =>
            resolve(
                (req.result as PendingAttendance[]).sort((a, b) => a.queuedAt - b.queuedAt)
            )
        req.onerror = () => reject(req.error)
    })
}

/** Elimina un registro pendiente ya sincronizado. */
export async function removePending(id: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PENDING, "readwrite")
        tx.objectStore(STORE_PENDING).delete(id)
        tx.oncomplete = () => resolve()
        tx.onerror    = () => reject(tx.error)
    })
}

/** Actualiza el contador de reintentos y fecha del último intento. */
export async function updatePendingRetry(id: string, retries: number): Promise<void> {
    const db = await openDB()

    const existing = await new Promise<PendingAttendance | undefined>((resolve, reject) => {
        const tx  = db.transaction(STORE_PENDING, "readonly")
        const req = tx.objectStore(STORE_PENDING).get(id)
        req.onsuccess = () => resolve(req.result as PendingAttendance | undefined)
        req.onerror   = () => reject(req.error)
    })

    if (!existing) return

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PENDING, "readwrite")
        tx.objectStore(STORE_PENDING).put({ ...existing, retries, lastAttempt: Date.now() })
        tx.oncomplete = () => resolve()
        tx.onerror    = () => reject(tx.error)
    })
}

/** Total de registros pendientes de sincronizar. */
export async function countPending(): Promise<number> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_PENDING, "readonly")
        const req = tx.objectStore(STORE_PENDING).count()
        req.onsuccess = () => resolve(req.result as number)
        req.onerror   = () => reject(req.error)
    })
}

// ─── Operaciones sobre local-checkins ────────────────────────────────────────

/**
 * Verifica si una cédula ya hizo check-in en un día de evento usando
 * únicamente el índice local — sin llamadas al servidor.
 * Previene duplicados cuando el dispositivo está offline.
 */
export async function isLocallyCheckedIn(
    cedula:     string,
    eventDayId: string
): Promise<boolean> {
    const db  = await openDB()
    const key = `${cedula}::${eventDayId}`
    return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_CHECKINS, "readonly")
        const req = tx.objectStore(STORE_CHECKINS).get(key)
        req.onsuccess = () => resolve(!!req.result)
        req.onerror   = () => reject(req.error)
    })
}

/**
 * Registra un check-in online en el índice local también,
 * para que las verificaciones offline futuras sean consistentes.
 */
export async function markLocalCheckin(
    cedula:     string,
    eventDayId: string
): Promise<void> {
    const db  = await openDB()
    const key = `${cedula}::${eventDayId}`
    const checkin: LocalCheckin = { key, cedula, eventDayId, checkedAt: Date.now() }
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CHECKINS, "readwrite")
        tx.objectStore(STORE_CHECKINS).put(checkin)
        tx.oncomplete = () => resolve()
        tx.onerror    = () => reject(tx.error)
    })
}
