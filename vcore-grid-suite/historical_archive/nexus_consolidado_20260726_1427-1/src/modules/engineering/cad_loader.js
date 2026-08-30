/**
 * Suite Vcore Nexus - Engine de Parseo CAD 3D (.OBJ / .STL)
 * Parseo offline nativo de ultra-bajo consumo de RAM (Sin dependencias externas)
 */
class VcoreCADLoader {
    // Parseador de archivos Wavefront .OBJ (Vértices y Caras)
    static parseOBJ(text) {
        const lines = text.split('\n');
        const vertices = [];
        const faces = [];

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('v ')) {
                const parts = line.split(/\s+/).slice(1).map(Number);
                vertices.push(parts[0], parts[1], parts[2]);
            } else if (line.startsWith('f ')) {
                const parts = line.split(/\s+/).slice(1).map(p => {
                    const idx = p.split('/')[0];
                    return parseInt(idx, 10) - 1;
                });
                if (parts.length >= 3) {
                    faces.push(parts[0], parts[1], parts[2]);
                    if (parts.length === 4) { // Convertir cuadriláteros en triángulos
                        faces.push(parts[0], parts[2], parts[3]);
                    }
                }
            }
        }
        return { 
            vertices: new Float32Array(vertices), 
            indices: new Uint16Array(faces),
            vertexCount: vertices.length / 3,
            faceCount: faces.length / 3
        };
    }

    // Parseador de archivos Estereolitografía .STL (ASCII)
    static parseSTL(text) {
        const lines = text.split('\n');
        const vertices = [];

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('vertex')) {
                const parts = line.split(/\s+/).slice(1).map(Number);
                vertices.push(parts[0], parts[1], parts[2]);
            }
        }

        const indices = new Uint16Array(vertices.length / 3);
        for (let i = 0; i < indices.length; i++) indices[i] = i;

        return { 
            vertices: new Float32Array(vertices), 
            indices: indices,
            vertexCount: vertices.length / 3,
            faceCount: (vertices.length / 3) / 3
        };
    }
}

if (typeof module !== 'undefined') module.exports = VcoreCADLoader;
