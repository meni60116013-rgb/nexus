import { runEngineeringPipeline } from './masterEngineSync.js';

export function updateRenderWithEngineering(params = { stiffness: 1.0, load: 500 }) {
    const engineeringData = runEngineeringPipeline(params);
    
    // Inyección de métricas estructurales al DOM o motor gráfico 3D
    const container = document.getElementById('render-status');
    if (container) {
        container.innerText = `[ Render 3D Activo - Estado: ${engineeringData.status} ]`;
    }
    
    return engineeringData;
}

// Inicialización automática del pipeline gráfico-estructural
document.addEventListener("DOMContentLoaded", () => {
    updateRenderWithEngineering();
});
