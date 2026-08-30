import { runEngineeringPipeline } from '../engines/masterEngineSync.js';

export function bindEngineDataToUI(params = {}) {
    const results = runEngineeringPipeline(params);
    
    // Enlazar al Visor 3D
    const visorEl = document.getElementById('render-status');
    if (visorEl) {
        visorEl.innerText = `[ Render 3D Activo - Estado: ${results.status} ]`;
    }

    // Enlazar al panel FEA / Motor
    const feaEl = document.getElementById('fea-panel');
    if (feaEl) {
        feaEl.innerHTML = `Stress Máx: ${results.fea.maxStressMPa} MPa | FS: ${results.fea.safetyFactor}`;
    }

    // Enlazar al panel de Costos / ERP
    const costsEl = document.getElementById('costs-panel');
    if (costsEl) {
        costsEl.innerHTML = `ERP Sincronizado | Sistema Operativo`;
    }

    return results;
}

document.addEventListener("DOMContentLoaded", () => {
    bindEngineDataToUI();
});
