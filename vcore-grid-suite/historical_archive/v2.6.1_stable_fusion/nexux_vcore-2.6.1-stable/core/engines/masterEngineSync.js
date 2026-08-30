import { calculateTrellisGeometry } from './trellis.js';
import { evaluateStructuralStrength } from './strengthEngine.js';
import { runFiniteElementAnalysis } from './feaEngine.js';
import { runSystemDiagnostics } from './diagnostics.js';
import { interpretDtcCodes } from './dtc_interpreter.js';
import { calculateKinematics } from './engine_kinematics.js';
import { getBalanceFactor } from './crankshaft_balance.js';
import { initDatabase } from './dbEngine.js';
import { exportToDXF } from './dxf_exporter.js';
import { calculateDynamicCompression } from './dynamic_compression.js';
import { checkElectricalWiring } from './electrical_wiring.js';
import { tuneExhaust } from './exhaust_tuning.js';
import { optimizeFuelInjector } from './fuel_injector.js';
import { calculateGears } from './gearEngine.js';
import { calculateSuspensionSpring } from './suspension_spring.js';
import { syncRebote } from './sync_rebote.js';
import { runTestingSuite } from './testing.js';
import { evaluateTubularStrength } from './tubular_strength.js';
import { calculateWorkshopERP } from './workshop_erp.js';

export function runEngineeringPipeline(params = {}) {
    return {
        status: "FULL_SYSTEM_ONLINE",
        timestamp: new Date().toISOString(),
        trellis: calculateTrellisGeometry(params),
        structural: evaluateStructuralStrength(params),
        fea: runFiniteElementAnalysis(params),
        diagnostics: runSystemDiagnostics(),
        dtc: interpretDtcCodes(),
        kinematics: calculateKinematics(params.rpm || 3000),
        balance: getBalanceFactor(),
        database: initDatabase(),
        dxf: exportToDXF(),
        compression: calculateDynamicCompression(),
        electrical: checkElectricalWiring(),
        exhaust: tuneExhaust(),
        fuel: optimizeFuelInjector(),
        gears: calculateGears(),
        suspension: calculateSuspensionSpring(),
        rebote: syncRebote(),
        testing: runTestingSuite(),
        tubular: evaluateTubularStrength(),
        erp: calculateWorkshopERP()
    };
}
