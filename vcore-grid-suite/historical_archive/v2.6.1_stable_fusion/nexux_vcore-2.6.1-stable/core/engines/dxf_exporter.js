export default class DXFExporter {
  generarDXFChasis() {
    // Estructura vectorial estandarizada DXF (HEADER, TABLES, ENTITIES)
    const dxfHeader = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;
    const dxfFooter = `0\nENDSEC\n0\nEOF\n`;

    // Entidades de tubos y travesaños
    const entidades = [
      `0\nLINE\n8\nTUBOS_SUPERIORES\n10\n-2.0\n20\n0.2\n11\n2.0\n21\n0.2\n`,
      `0\nLINE\n8\nCUNA_INFERIOR\n10\n-1.8\n20\n-0.8\n11\n1.8\n21\n-0.8\n`,
      `0\nCIRCLE\n8\nPERFIL_TUBO_CEDULA40\n10\n0.0\n20\n0.0\n40\n0.08\n`
    ].join('');

    return dxfHeader + entidades + dxfFooter;
  }

  descargarArchivo(contenido, nombreArchivo, mime) {
    const blob = new Blob([contenido], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
  }
}
