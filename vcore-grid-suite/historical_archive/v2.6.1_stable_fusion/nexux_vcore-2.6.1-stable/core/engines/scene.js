import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GUI } from 'lil-gui';
import { TrellisBuilder } from './trellis.js';
import { BikeAssembly, BIKE_CATALOG } from './assembly.js';
import { runVirtualAudit } from './testing.js';
import { calculateStructuralMetrics, MATERIALS } from './analysis.js';
import { analyzeCircuitProtection } from './diagnostics.js';
import { injectWatermark, LICENSE_INFO } from './security.js';
import { generateTechnicalPDF } from './pdfReport.js';

export function createEngine(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1117);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(2.5, 2, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.35;
  controls.zoomSpeed = 0.5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const gridHelper = new THREE.GridHelper(10, 20, 0x58a6ff, 0x30363d);
  scene.add(gridHelper);

  const builder = new TrellisBuilder(scene);
  builder.params.materialKey = 'chromoly';

  const bikeAssembly = new BikeAssembly(scene);

  let currentScreen = 'chassis'; // 'chassis', 'assembly', 'electrical', 'testing'

  const updateScreenVisibility = () => {
    builder.frameGroup.visible = (currentScreen !== 'electrical');
    bikeAssembly.assemblyGroup.visible = (currentScreen !== 'chassis');
    
    if (currentScreen === 'testing') {
      auditPanel.classList.add('visible');
      supplierPanel.classList.remove('visible');
      renderAuditResults();
    } else if (currentScreen === 'assembly') {
      supplierPanel.classList.add('visible');
      auditPanel.classList.remove('visible');
      renderSupplierInfo();
    } else {
      auditPanel.classList.remove('visible');
      supplierPanel.classList.remove('visible');
    }
  };

  injectWatermark(container);

  // Panel flotante de Proveedores y Co-Financiamiento (Pantalla 2)
  const supplierPanel = document.createElement('div');
  supplierPanel.className = 'supplier-overlay';
  container.appendChild(supplierPanel);

  const renderSupplierInfo = () => {
    const report = bikeAssembly.getCompatibilityAndSponsorshipReport();
    let partsHtml = report.details.map(d => `
      <div class="supplier-card">
        <div><strong>[${d.category}]</strong> ${d.name}</div>
        <div style="color: #8b949e;">Proveedor: ${d.supplier}</div>
        <div style="color: #58a6ff;">Alianza: ${d.sponsorshipTier}</div>
        <div style="color: #3fb950;">Compatibilidad: ${d.compatibilityScore}% | Riesgo: ${d.legalRisk}</div>
      </div>
    `).join('');

    supplierPanel.innerHTML = `
      <div class="supplier-header">
        <span>🤝 Proveedores & Co-Financiamiento</span>
        <span style="color: #3fb950;">$${report.totalCost} USD</span>
      </div>
      <div><strong>Índice de Viabilidad Multi-Marca:</strong></div>
      <div class="comp-bar-container">
        <div class="comp-bar-fill" style="width: ${report.avgCompatibility}%;"></div>
      </div>
      <div style="text-align: right; margin-bottom: 8px; color: ${report.avgCompatibility > 85 ? '#3fb950' : '#d29922'};">
        <strong>${report.avgCompatibility}% - ${report.avgCompatibility > 85 ? 'Óptimo para Ensamblaje' : 'Requiere Adaptadores'}</strong>
      </div>
      <div>${partsHtml}</div>
      <div style="font-size: 9px; color: #8b949e; margin-top: 6px;">
        * Nota: Las marcas asociadas co-financian componentes a cambio de exhibición en el prototipo. Sin riesgo legal por patentes cruzadas.
      </div>
    `;
  };

  // Panel flotante de Auditoría y Certificación (Pantalla 4)
  const auditPanel = document.createElement('div');
  auditPanel.className = 'audit-overlay';
  container.appendChild(auditPanel);

  const diagParams = { vIn: 12.0, iSense: 0.25, rFeedback: 5.6 };

  const renderAuditResults = () => {
    const audit = runVirtualAudit(builder.params, bikeAssembly.params, diagParams);
    
    let badgeHtml = `<span class="badge-pass">APROBADO</span>`;
    if (audit.overallStatus === 'WARNING') badgeHtml = `<span class="badge-warning">ADVERTENCIAS</span>`;
    if (audit.overallStatus === 'DANGER') badgeHtml = `<span class="badge-danger">PUNTOS CRÍTICOS</span>`;

    let logsHtml = audit.auditLogs.map(l => `
      <div class="log-item ${l.type.toLowerCase()}">
        <strong>[${l.category}]</strong> ${l.msg}
      </div>
    `).join('');

    auditPanel.innerHTML = `
      <div class="audit-header">
        <span>🧪 Certificación V-Core</span>
        ${badgeHtml}
      </div>
      <div><strong>Evaluación Global:</strong> ${audit.overallStatus}</div>
      <div style="margin: 8px 0; border-top: 1px dashed #30363d; padding-top: 6px;">
        ${logsHtml}
      </div>
      <div style="font-size: 9px; color: #8b949e; margin-top: 8px;">
        * Nota: Los fallos detectados son informativos. Queda a criterio del equipo de implementación mantener o ajustar la geometría.
      </div>
    `;
  };

  // Barra de Navegación Wizard
  const wizardNav = document.createElement('div');
  wizardNav.className = 'nav-wizard';
  wizardNav.innerHTML = `
    <button class="wizard-btn active" id="nav-chassis">1. Chasis</button>
    <button class="wizard-btn" id="nav-assembly">2. Ensamblaje</button>
    <button class="wizard-btn" id="nav-electrical">3. Eléctrico</button>
    <button class="wizard-btn" id="nav-testing">4. Pruebas & Cert</button>
  `;
  container.appendChild(wizardNav);

  // Interfaz D-Pad flotante
  const dpad = document.createElement('div');
  dpad.className = 'dpad-container';
  dpad.innerHTML = `
    <button class="dpad-btn up" id="btn-up">▲</button>
    <button class="dpad-btn left" id="btn-left">◀</button>
    <button class="dpad-btn center" id="btn-reset">RST</button>
    <button class="dpad-btn right" id="btn-right">▶</button>
    <button class="dpad-btn down" id="btn-down">▼</button>
  `;
  container.appendChild(dpad);

  // Interfaz de Zoom flotante
  const zoomControl = document.createElement('div');
  zoomControl.className = 'zoom-container';
  zoomControl.innerHTML = `
    <button class="zoom-btn" id="btn-zoomin">+</button>
    <button class="zoom-btn" id="btn-zoomout">-</button>
  `;
  container.appendChild(zoomControl);

  const STEP = 0.15;
  document.getElementById('btn-up').onclick = () => { camera.position.y += 0.3; controls.update(); };
  document.getElementById('btn-down').onclick = () => { camera.position.y -= 0.3; controls.update(); };
  document.getElementById('btn-left').onclick = () => {
    const x = camera.position.x, z = camera.position.z;
    camera.position.x = x * Math.cos(STEP) - z * Math.sin(STEP);
    camera.position.z = x * Math.sin(STEP) + z * Math.cos(STEP);
    controls.update();
  };
  document.getElementById('btn-right').onclick = () => {
    const x = camera.position.x, z = camera.position.z;
    camera.position.x = x * Math.cos(-STEP) - z * Math.sin(-STEP);
    camera.position.z = x * Math.sin(-STEP) + z * Math.cos(-STEP);
    controls.update();
  };
  document.getElementById('btn-reset').onclick = () => { camera.position.set(2.5, 2, 3.5); controls.target.set(0, 0, 0); controls.update(); };
  document.getElementById('btn-zoomin').onclick = () => { camera.position.multiplyScalar(0.85); controls.update(); };
  document.getElementById('btn-zoomout').onclick = () => { camera.position.multiplyScalar(1.15); controls.update(); };

  let gui = null;

  const rebuildGUI = () => {
    if (gui) gui.destroy();
    gui = new GUI({ autoPlace: true, title: `⚙️ V-Core: [${currentScreen.toUpperCase()}]` });
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '60px';
    gui.domElement.style.right = '10px';
    gui.domElement.style.zIndex = '100';

    if (currentScreen === 'chassis') {
      const f1 = gui.addFolder('Geometría Chasis');
      f1.add(builder.params, 'tubeRadius', 0.01, 0.1, 0.005).name('Grosor Tubo').onChange(updateMetrics);
      f1.add(builder.params, 'headstockHeight', 0.8, 1.8, 0.05).name('Alt. Dirección').onChange(updateMetrics);
      f1.add(builder.params, 'pivotWidth', 0.3, 1.0, 0.05).name('Ancho Pivote').onChange(updateMetrics);
      f1.add(builder.params, 'chassisLength', 1.0, 2.2, 0.05).name('Largo Chasis').onChange(updateMetrics);

      const f2 = gui.addFolder('Materiales');
      f2.add(builder.params, 'materialKey', Object.keys(MATERIALS)).name('Material').onChange(updateMetrics);

      const f3 = gui.addFolder('Telemetría');
      f3.add(metricsDisplay, 'weight').name('Peso Est.').listen();
      f3.add(metricsDisplay, 'torque').name('Torque Máx.').listen();
      f3.add(metricsDisplay, 'safety').name('Factor Seg.').listen();

      const f5 = gui.addFolder('Exportación');
      f5.add({ export: exportSTL }, 'export').name('Descargar (.STL)');
      f5.add({ exportPDF: exportPDF }, 'exportPDF').name('Generar Ficha (.PDF)');
    } 
    else if (currentScreen === 'assembly') {
      const fBike = gui.addFolder('Catálogo Proveedores');
      fBike.add(bikeAssembly.params, 'wheelType', Object.keys(BIKE_CATALOG.wheels)).name('Rines / Marca').onChange(updateAssembly);
      fBike.add(bikeAssembly.params, 'engineType', Object.keys(BIKE_CATALOG.engines)).name('Motor / OEM').onChange(updateAssembly);
      fBike.add(bikeAssembly.params, 'tankType', Object.keys(BIKE_CATALOG.tanks)).name('Depósito').onChange(updateAssembly);
      fBike.add(bikeAssembly.params, 'hasFairing').name('Carenado').onChange(updateAssembly);
      fBike.add(bikeAssembly.params, 'hasChain').name('Kit Transmisión').onChange(updateAssembly);

      const f5 = gui.addFolder('Exportación');
      f5.add({ export: exportSTL }, 'export').name('Descargar (.STL)');
    }
    else if (currentScreen === 'electrical') {
      const f4 = gui.addFolder('Sistema Eléctrico');
      f4.add(diagParams, 'vIn', 0, 24, 0.5).name('Voltaje In (V)').onChange(updateDiag);
      f4.add(diagParams, 'iSense', 0, 1.0, 0.05).name('I Sense (A)').onChange(updateDiag);
      f4.add(diagParams, 'rFeedback', 1, 20, 0.1).name('R Feedback (Ω)').onChange(updateDiag);
      f4.add(diagDisplay, 'status').name('Estado Lazo').listen();
      f4.add(diagDisplay, 'vRef').name('VRef Medido').listen();
    }
    else if (currentScreen === 'testing') {
      const fTest = gui.addFolder('Auditoría Industrial');
      fTest.add({ run: () => renderAuditResults() }, 'run').name('🔄 Re-ejecutar Pruebas');
      fTest.open();
    }

    if (window.innerWidth <= 768) { gui.close(); }
  };

  document.getElementById('nav-chassis').onclick = () => { currentScreen = 'chassis'; updateActiveNav(); updateScreenVisibility(); rebuildGUI(); };
  document.getElementById('nav-assembly').onclick = () => { currentScreen = 'assembly'; updateActiveNav(); updateScreenVisibility(); rebuildGUI(); };
  document.getElementById('nav-electrical').onclick = () => { currentScreen = 'electrical'; updateActiveNav(); updateScreenVisibility(); rebuildGUI(); };
  document.getElementById('nav-testing').onclick = () => { currentScreen = 'testing'; updateActiveNav(); updateScreenVisibility(); rebuildGUI(); };

  const updateActiveNav = () => {
    document.querySelectorAll('.wizard-btn').forEach(b => b.classList.remove('active'));
    if (currentScreen === 'chassis') document.getElementById('nav-chassis').classList.add('active');
    if (currentScreen === 'assembly') document.getElementById('nav-assembly').classList.add('active');
    if (currentScreen === 'electrical') document.getElementById('nav-electrical').classList.add('active');
    if (currentScreen === 'testing') document.getElementById('nav-testing').classList.add('active');
  };

  const exportSTL = () => {
    const exporter = new STLExporter();
    const groupToExport = new THREE.Group();
    if (builder.frameGroup.visible) groupToExport.add(builder.frameGroup.clone(true));
    if (bikeAssembly.assemblyGroup.visible) groupToExport.add(bikeAssembly.assemblyGroup.clone(true));

    const result = exporter.parse(groupToExport, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vcore_assembly_${LICENSE_INFO.buildHash}.stl`;
    link.click();
  };

  const exportPDF = () => {
    const metrics = calculateStructuralMetrics(builder.params);
    generateTechnicalPDF(builder.params, metrics);
  };

  const updateMetrics = () => {
    builder.buildChassis();
    const metrics = calculateStructuralMetrics(builder.params);
    metricsDisplay.weight = `${metrics.weightKg} kg`;
    metricsDisplay.torque = `${metrics.maxTorqueNm} kNm`;
    metricsDisplay.safety = metrics.safetyFactor;
    if (gui) gui.controllersRecursive().forEach(c => c.updateDisplay());
  };

  const updateAssembly = () => { 
    bikeAssembly.buildAssembly(); 
    if (currentScreen === 'assembly') renderSupplierInfo();
  };

  const diagDisplay = { status: 'OK', vRef: '0 V', action: 'OK' };

  const updateDiag = () => {
    const res = analyzeCircuitProtection(diagParams.vIn, diagParams.iSense, diagParams.rFeedback);
    diagDisplay.status = res.status;
    diagDisplay.vRef = `${res.vRef} V`;
    diagDisplay.action = res.action;
    if (currentScreen === 'testing') renderAuditResults();
    if (gui) gui.controllersRecursive().forEach(c => c.updateDisplay());
  };

  const metricsDisplay = { weight: '0 kg', torque: '0 kNm', safety: '0' };

  builder.buildChassis();
  bikeAssembly.buildAssembly();
  updateMetrics();
  updateDiag();
  updateScreenVisibility();
  rebuildGUI();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  animate();
}
