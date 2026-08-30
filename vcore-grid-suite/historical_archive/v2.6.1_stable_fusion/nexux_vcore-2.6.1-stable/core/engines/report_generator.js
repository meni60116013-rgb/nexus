// V-CORE SENTINEL // Generador de Reportes Técnicos
export const reportGenerator = {
  generarFichaHTML: function(data) {
    return `
      <div style="border:2px solid #00ffcc; padding:20px; background:#0d0d0d; color:#fff; font-family:monospace; max-width:600px; margin:auto;">
        <h2 style="color:#00ffcc; text-align:center; margin-top:0;">V-CORE SENTINEL // DICTAMEN TÉCNICO</h2>
        <p><strong>VIN:</strong> ${data.vin}</p>
        <p><strong>FECHA:</strong> ${new Date().toLocaleString('es-MX')}</p>
        <hr style="border-color:#333;">
        <p><strong>Estructura Chasis (FdS):</strong> ${data.fds}</p>
        <p><strong>Relación Transmisión:</strong> ${data.ratio}</p>
        <p><strong>Disipación Térmica:</strong> ${data.calor}</p>
      </div>
    `;
  }
};
