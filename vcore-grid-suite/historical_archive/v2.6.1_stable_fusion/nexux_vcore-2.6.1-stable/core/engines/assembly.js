import * as THREE from 'three';

// Catálogo enriquecido con Proveedores, Acuerdos de Co-Financiamiento y Factores de Compatibilidad
export const BIKE_CATALOG = {
  wheels: {
    'spoke_classic': { 
      name: 'Rines de Rayos Clásicos', 
      supplier: 'Kenda / Excel Takasago', 
      sponsorshipTier: 'Gold Partner (50% Subsidio)', 
      compatibilityScore: 95, 
      legalRisk: 'Bajo - Estandar abierto',
      cost: 450 
    },
    'alloy_sport': { 
      name: 'Aleación Deportiva Ligeros', 
      supplier: 'Marchesini Forged', 
      sponsorshipTier: 'Colaborador Técnico', 
      compatibilityScore: 88, 
      legalRisk: 'Medio - Licencia de marca requerida',
      cost: 1200 
    },
    'carbon_racing': { 
      name: 'Fibra de Carbono Monolítico', 
      supplier: 'BST Carbon', 
      sponsorshipTier: 'Sin Alianza (Compra Directa)', 
      compatibilityScore: 72, 
      legalRisk: 'Alto - Restricciones de patente estructural',
      cost: 2800 
    }
  },
  engines: {
    'single_400cc': { 
      name: 'Monocilíndrico 400cc (Trellis fit)', 
      supplier: 'KTM Powerparts / Rotax', 
      sponsorshipTier: 'Patrocinador Principal (Motor a costo cero)', 
      compatibilityScore: 96, 
      legalRisk: 'Bajo - Contrato OEM activo',
      cost: 0 
    },
    'twin_650cc': { 
      name: 'Bicilíndrico en Línea 650cc', 
      supplier: 'Kawasaki Heavy Industries', 
      sponsorshipTier: 'Proveedor Externo', 
      compatibilityScore: 81, 
      legalRisk: 'Medio - Adaptación de soportes necesaria',
      cost: 1900 
    },
    'electric_brushless': { 
      name: 'Motor Eléctrico Axial Flux', 
      supplier: 'Emrax / Bosch EV', 
      sponsorshipTier: 'Alianza Tecnológica I+D', 
      compatibilityScore: 90, 
      legalRisk: 'Bajo - Código abierto de acoplamiento',
      cost: 2400 
    }
  },
  tanks: {
    'aluminum_custom': { 
      name: 'Tanque Artesanal Aluminio', 
      supplier: 'Handmade Alloy Works', 
      sponsorshipTier: 'Fabricación Local (Independiente)', 
      compatibilityScore: 92, 
      legalRisk: 'Nulo - Diseño propio',
      cost: 350 
    },
    'poly_standard': { 
      name: 'Depósito Polímero de Alto Impacto', 
      supplier: 'Acerbis Plastics', 
      sponsorshipTier: 'Patrocinador de Componentes', 
      compatibilityScore: 98, 
      legalRisk: 'Bajo - Estándar industrial',
      cost: 210 
    }
  }
};

export class BikeAssembly {
  constructor(scene) {
    this.scene = scene;
    this.assemblyGroup = new THREE.Group();
    this.scene.add(this.assemblyGroup);

    this.params = {
      wheelType: 'spoke_classic',
      engineType: 'single_400cc',
      tankType: 'poly_standard',
      hasFairing: true,
      hasChain: true
    };

    this.buildAssembly();
  }

  buildAssembly() {
    while (this.assemblyGroup.children.length > 0) {
      this.assemblyGroup.remove(this.assemblyGroup.children[0]);
    }

    const matCol = new THREE.MeshStandardMaterial({ color: 0x1f6feb, roughness: 0.3, metalness: 0.8 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x21262d, roughness: 0.5 });
    const matAccent = new THREE.MeshStandardMaterial({ color: 0xf0883e, roughness: 0.2 });

    // 1. Bloque Motor Central
    const engineGeo = new THREE.BoxGeometry(0.5, 0.45, 0.6);
    const engineMesh = new THREE.Mesh(engineGeo, matDark);
    engineMesh.position.set(0, -0.2, 0);
    this.assemblyGroup.add(engineMesh);

    // 2. Ruedas (Delantera y Trasera)
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
    wheelGeo.rotateX(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, matCol);
    frontWheel.position.set(0, -0.4, 1.1);
    this.assemblyGroup.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, matCol);
    rearWheel.position.set(0, -0.4, -1.1);
    this.assemblyGroup.add(rearWheel);

    // 3. Tanque de Combustible / Batería Superior
    const tankGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const tankMesh = new THREE.Mesh(tankGeo, this.params.tankType === 'aluminum_custom' ? matCol : matAccent);
    tankMesh.position.set(0, 0.4, 0.2);
    tankMesh.scale.set(0.9, 0.8, 1.4);
    this.assemblyGroup.add(tankMesh);

    // 4. Carenado Opcional
    if (this.params.hasFairing) {
      const fairingGeo = new THREE.ConeGeometry(0.4, 0.8, 16);
      fairingGeo.rotateX(Math.PI / 2);
      const fairingMesh = new THREE.Mesh(fairingGeo, matCol);
      fairingMesh.position.set(0, 0.2, 0.9);
      this.assemblyGroup.add(fairingMesh);
    }
  }

  // Obtener reporte de compatibilidad y financiamiento de las piezas seleccionadas
  getCompatibilityAndSponsorshipReport() {
    const wheel = BIKE_CATALOG.wheels[this.params.wheelType];
    const engine = BIKE_CATALOG.engines[this.params.engineType];
    const tank = BIKE_CATALOG.tanks[this.params.tankType];

    const avgCompatibility = Math.round((wheel.compatibilityScore + engine.compatibilityScore + tank.compatibilityScore) / 3);
    const totalCost = wheel.cost + engine.cost + tank.cost;

    return {
      avgCompatibility,
      totalCost,
      details: [
        { category: 'Rines', ...wheel },
        { category: 'Motor/Propulsión', ...engine },
        { category: 'Tanque/Depósito', ...tank }
      ]
    };
  }
}
