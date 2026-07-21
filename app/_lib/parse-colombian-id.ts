export function parseColombianID(raw: string): { cedula: string; nombre: string; apellido: string } | null {
    if (!raw || raw.length < 50) return null;

    try {
        // Remover caracteres no imprimibles que algunos escáneres insertan
        const clean = raw.replace(/[^\x20-\x7EñÑáéíóúÁÉÍÓÚ]/g, '');
        
        // Buscar el marcador de género '0M' o '0F' típico en la cédula colombiana
        const genderMatch = clean.match(/0[MF]/i);
        if (!genderMatch) return null;
        
        const genderIndex = genderMatch.index!;
        
        // El texto antes del género contiene [Cédula] + [Nombres y Apellidos]
        const textBeforeGender = clean.substring(0, genderIndex);
        
        // Buscar el último bloque de números (cédula) seguido de letras (nombres)
        const match = textBeforeGender.match(/(\d+)([A-ZÑÁÉÍÓÚ\s]+)$/i);
        
        if (match) {
            let cedula = match[1];
            // Remover ceros a la izquierda (la trama suele tener la cédula a 10 dígitos)
            cedula = cedula.replace(/^0+/, '');
            
            const fullNames = match[2].trim();
            
            // La trama original separa con múltiples espacios. Si el escáner los respeta:
            let parts = fullNames.split(/\s{2,}/);
            
            if (parts.length === 1) {
               // Si el escáner colapsó los espacios, separamos por espacio simple
               parts = fullNames.split(' ');
            }
            
            let apellido = "";
            let nombre = "";
            
            // El orden estándar es: Apellido1 Apellido2 Nombre1 Nombre2
            if (parts.length >= 4) {
                apellido = `${parts[0]} ${parts[1]}`.trim();
                nombre = parts.slice(2).join(' ').trim();
            } else if (parts.length === 3) {
                apellido = `${parts[0]} ${parts[1]}`.trim();
                nombre = parts[2].trim();
            } else if (parts.length === 2) {
                apellido = parts[0].trim();
                nombre = parts[1].trim();
            } else {
                apellido = parts[0].trim();
                nombre = ""; // Fallback
            }
            
            return { cedula, nombre, apellido };
        }
    } catch (e) {
        return null;
    }
    
    return null;
}
