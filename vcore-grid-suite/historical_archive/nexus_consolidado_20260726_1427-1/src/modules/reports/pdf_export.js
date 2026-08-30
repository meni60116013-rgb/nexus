/**
 * Suite Vcore Nexus - Motor de Exportación e Impresión de Reportes de Taller
 */
class VcoreReportGenerator {
    static generatePrintableReport(vehicleData, diagnostics, engineeringData) {
        const printWindow = window.open('', '_blank');
        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de Taller - Suite Vcore Nexus</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
                    h1 { color: #0d1117; border-bottom: 2px solid #238636; padding-bottom: 5px; }
                    .section { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }
                    .header-info { display: flex; justify-content: space-between; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>🛠️ V-CORE MOBILE WORKSHOP - REPORTE DE SERVICIO</h1>
                <div class="header-info">
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Sistema:</strong> Suite Vcore Nexus (Edición Oficial)</p>
                </div>
                
                <div class="section">
                    <h3>Ficha del Vehículo</h3>
                    <p><strong>Vehículo:</strong> ${vehicleData ? vehicleData.brand + ' ' + vehicleData.model : 'Genérico / No asignado'}</p>
                    <p><strong>Año / Motor:</strong> ${vehicleData ? vehicleData.year + ' (' + vehicleData.engine.displacementCc + 'cc)' : 'N/A'}</p>
                </div>

                <div class="section">
                    <h3>Resultados de Diagnóstico & Telemetría</h3>
                    <p>${diagnostics || 'Sin códigos de falla activos.'}</p>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(reportHTML);
        printWindow.document.close();
    }
}

if (typeof module !== 'undefined') module.exports = VcoreReportGenerator;
