export function parseColombianID(raw: string): { cedula: string; nombre: string; apellido: string } | null {
    if (!raw) return null;

    try {
        // 1. Formato de escáner en ráfaga con separadores Tab (\t) y Enter (\n, \r)
        if (raw.includes('\t') || raw.includes('\n') || raw.includes('\r')) {
            const rawParts = raw.split(/[\t\r\n]/).map(s => s.trim());
            const nonEmp = rawParts.filter(Boolean);

            if (nonEmp.length >= 2 && /\d/.test(nonEmp[0])) {
                const cedula = nonEmp[0].replace(/\D/g, '').replace(/^0+/, '');

                let apellido = "";
                let nombre = "";

                if (rawParts.length >= 5 && nonEmp.length >= 4) {
                    const ap1 = rawParts[1] || "";
                    const ap2 = rawParts[2] || "";
                    const nom1 = rawParts[3] || "";
                    const nom2 = rawParts[4] || "";

                    apellido = `${ap1} ${ap2}`.trim();
                    nombre = `${nom1} ${nom2}`.trim();
                } else if (nonEmp.length === 5) {
                    apellido = `${nonEmp[1]} ${nonEmp[2]}`.trim();
                    nombre = `${nonEmp[3]} ${nonEmp[4]}`.trim();
                } else if (nonEmp.length === 4) {
                    apellido = `${nonEmp[1]} ${nonEmp[2]}`.trim();
                    nombre = nonEmp[3].trim();
                } else if (nonEmp.length === 3) {
                    apellido = nonEmp[1].trim();
                    nombre = nonEmp[2].trim();
                } else if (nonEmp.length === 2) {
                    apellido = nonEmp[1].trim();
                    nombre = "";
                }

                if (cedula) {
                    return { cedula, nombre, apellido };
                }
            }
        }

        // 2. Formato PDF417 binario estándar de cédula colombiana
        if (raw.length < 50) return null;

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
