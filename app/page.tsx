import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Eventos.app · Gestión de eventos y asistentes",
  description:
    "Sistema de software para crear eventos, registrar asistentes y realizar check-in mediante escaneo de cédula, OCR e impresión de escarapela.",
}

/* ── Íconos SVG inline (sin dependencia externa) ───────────────────── */
function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
function IconScan() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  )
}
function IconPrint() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}
function IconOcr() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="6" y1="10" x2="6" y2="14" />
      <line x1="9" y1="10" x2="9" y2="14" />
      <line x1="12" y1="10" x2="12" y2="12" />
      <line x1="15" y1="10" x2="15" y2="14" />
      <line x1="18" y1="10" x2="18" y2="13" />
    </svg>
  )
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

/* ── Datos de características ───────────────────────────────────────── */
const features = [
  {
    icon: <IconCalendar />,
    title: "Gestión de eventos",
    description:
      "Crea y administra eventos con fechas, ubicación y cupo. Visualiza el estado en tiempo real: activos, próximos y finalizados.",
    color: "var(--color-primary)",
  },
  {
    icon: <IconUser />,
    title: "Registro de asistentes",
    description:
      "Formulario de primera vez para capturar nombre, cédula, ciudad y datos de contacto. El asistente queda vinculado al evento automáticamente.",
    color: "var(--color-accent)",
  },
  {
    icon: <IconScan />,
    title: "Escaneo físico de cédula",
    description:
      "Escáner de código de barras para lecturas instantáneas. El sistema identifica al asistente y verifica su inscripción en décimas de segundo.",
    color: "var(--color-primary)",
  },
  {
    icon: <IconOcr />,
    title: "Extracción automática (OCR)",
    description:
      "Si el escáner no puede leer el código, el módulo OCR extrae los datos del documento de identidad con un simple enfoque de cámara.",
    color: "var(--color-accent)",
  },
  {
    icon: <IconPrint />,
    title: "Impresión de escarapela",
    description:
      "Al completar el check-in, el sistema genera e imprime la escarapela personalizada del asistente de forma inmediata sin pasos adicionales.",
    color: "var(--color-primary)",
  },
]

/* ── Pasos del flujo ────────────────────────────────────────────────── */
const steps = [
  { n: "01", label: "Crear evento", detail: "Define nombre, fecha, lugar y cupo disponible." },
  { n: "02", label: "Registrar asistente", detail: "Primera vez: formulario completo con datos personales." },
  { n: "03", label: "Escanear cédula", detail: "Visitas siguientes: lector físico o cámara OCR." },
  { n: "04", label: "Check-in", detail: "Validación automática e impresión instantánea de escarapela." },
]

/* ── Componente principal ───────────────────────────────────────────── */
export default function Home() {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-background)", color: "var(--color-text)" }}
    >
      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 lg:px-10 py-4"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span className="text-base font-bold tracking-tight" style={{ fontFamily: "var(--font-galindo)" }}>
          Eventos
          <span style={{ color: "var(--color-accent)" }}>.app</span>
        </span>

        <nav className="flex items-center gap-1">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-sm transition-all"
            style={{ color: "var(--color-primary)" }}
            id="nav-login"
          >
            Ingresar
            <IconChevron />
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center px-5 pt-20 pb-16 lg:pt-28 lg:pb-20">
          {/* Badge alcance */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-sm mb-6"
            style={{
              background: "rgba(225,131,53,0.1)",
              color: "var(--color-accent)",
              border: "1px solid rgba(225,131,53,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            Alcance del sistema
          </span>

          <h1
            className="text-4xl lg:text-6xl font-bold leading-tight max-w-3xl mb-5"
            style={{ fontFamily: "var(--font-galindo)", letterSpacing: "-0.01em" }}
          >
            Gestión de eventos
            <br />
            <span style={{ color: "var(--color-primary)" }}>y registro</span>{" "}
            de asistentes
          </h1>

          <p
            className="text-base lg:text-lg max-w-xl leading-relaxed mb-10"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sistema integral para crear eventos, registrar personas mediante
            formulario, y realizar check-in con escaneo de cédula, OCR e
            impresión automática de escarapela.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              id="hero-cta-primary"
              className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-sm transition-all"
              style={{
                background: "var(--color-primary)",
                color: "#fff",
              }}
            >
              Acceder al sistema
              <IconArrow />
            </Link>
            <a
              href="#flujo"
              id="hero-cta-secondary"
              className="flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-sm transition-all"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            >
              Ver el flujo
            </a>
          </div>
        </section>

        {/* ── Divisor con stats ── */}
        <section
          className="grid grid-cols-2 lg:grid-cols-4 divide-x"
          style={{
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            ["--tw-divide-opacity" as string]: "1",
          }}
        >
          {[
            { value: "Eventos", label: "Creación y gestión" },
            { value: "Formulario", label: "Registro primera vez" },
            { value: "Escaneo", label: "Check-in por cédula" },
            { value: "Escarapela", label: "Impresión inmediata" },
          ].map((s) => (
            <div
              key={s.value}
              className="flex flex-col items-center justify-center px-4 py-7 gap-1 text-center"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: "var(--color-primary)", fontFamily: "var(--font-galindo)" }}
              >
                {s.value}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </section>

        {/* ── Características ── */}
        <section className="px-5 lg:px-10 py-16 lg:py-20 max-w-5xl mx-auto w-full">
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Módulos del sistema
          </p>
          <h2 className="text-2xl font-bold mb-10" style={{ fontFamily: "var(--font-galindo)" }}>
            Funcionalidades principales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <article
                key={f.title}
                className="flex flex-col gap-4 p-6 rounded-sm"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {/* Ícono */}
                <span
                  className="w-10 h-10 flex items-center justify-center rounded-sm"
                  style={{
                    background: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </span>

                <div>
                  <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {f.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Flujo de trabajo ── */}
        <section
          id="flujo"
          className="px-5 lg:px-10 py-16 lg:py-20 w-full"
          style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}
        >
          <div className="max-w-5xl mx-auto">
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Diagrama de referencia
            </p>
            <h2 className="text-2xl font-bold mb-10" style={{ fontFamily: "var(--font-galindo)" }}>
              Flujo de trabajo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <div key={step.n} className="flex flex-col gap-3 relative">
                  {/* Línea conectora (desktop) */}
                  {i < steps.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-5 left-[calc(100%_-_8px)] w-full h-px z-10"
                      style={{ background: "var(--color-border)" }}
                    />
                  )}

                  {/* Número */}
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 flex items-center justify-center text-xs font-bold rounded-sm shrink-0"
                      style={{ background: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-galindo)" }}
                    >
                      {step.n}
                    </span>
                    <h3 className="text-sm font-semibold">{step.label}</h3>
                  </div>

                  <p className="text-sm pl-[52px] lg:pl-0" style={{ color: "var(--color-text-muted)" }}>
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tecnología / roles ── */}
        <section className="px-5 lg:px-10 py-16 lg:py-20 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Tecnología */}
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Componentes técnicos
              </p>
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "var(--font-galindo)" }}>
                Cómo funciona
              </h2>
              <ul className="flex flex-col gap-3">
                {[
                  ["Escaneo físico", "Lector de código de barras conectado al sistema; captura la cédula al instante."],
                  ["OCR", "Reconocimiento óptico de caracteres como respaldo cuando el código no es legible."],
                  ["Check-in automático", "Verificación en base de datos y marcación de asistencia en tiempo real."],
                  ["Impresión de escarapela", "Generación e impresión directa del carnet al completar el check-in."],
                ].map(([term, def]) => (
                  <li
                    key={term}
                    className="flex gap-3 p-4 rounded-sm"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    <span
                      className="w-1.5 shrink-0 mt-1 rounded-full self-start"
                      style={{ height: "6px", background: "var(--color-accent)", marginTop: "6px" }}
                    />
                    <div>
                      <span className="text-sm font-semibold">{term}</span>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{def}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Roles */}
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Control de acceso
              </p>
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "var(--font-galindo)" }}>
                Roles del sistema
              </h2>
              <ul className="flex flex-col gap-3">
                {[
                  { role: "Administrador", color: "var(--color-primary)", perms: ["Gestión completa de eventos", "Alta y configuración de usuarios", "Asignación de roles", "Acceso a reportes globales"] },
                  { role: "Organizador", color: "var(--color-accent)", perms: ["Crear y editar sus eventos", "Ver asistentes registrados", "Supervisar check-in en vivo"] },
                  { role: "Staff", color: "var(--color-text-muted)", perms: ["Escaneo de cédulas", "Registro de primera vez", "Impresión de escarapela"] },
                ].map((r) => (
                  <li
                    key={r.role}
                    className="p-4 rounded-sm"
                    style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: r.color }}
                      />
                      <span className="text-sm font-semibold">{r.role}</span>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {r.perms.map((p) => (
                        <span
                          key={p}
                          className="text-[11px] px-2 py-0.5 rounded-sm"
                          style={{
                            background: "var(--color-background)",
                            color: "var(--color-text-muted)",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ── CTA final ── */}
        <section
          className="px-5 lg:px-10 py-16 flex flex-col items-center text-center"
          style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          <h2
            className="text-2xl lg:text-3xl font-bold mb-3 max-w-lg"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Listo para gestionar tu primer evento
          </h2>
          <p
            className="text-sm max-w-sm mb-8 leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Accede al sistema, crea un evento y empieza a registrar asistentes hoy mismo.
          </p>
          <Link
            href="/login"
            id="footer-cta"
            className="flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-sm"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            Ingresar al sistema
            <IconArrow />
          </Link>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        className="flex items-center justify-between px-5 lg:px-10 py-5 text-xs"
        style={{
          borderTop: "1px solid var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        <span style={{ fontFamily: "var(--font-galindo)" }}>
          Eventos<span style={{ color: "var(--color-accent)" }}>.app</span>
        </span>
        <span>Sistema de gestión de eventos y asistentes</span>
      </footer>
    </div>
  )
}