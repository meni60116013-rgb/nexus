import * as THREE from 'three';
import { MATERIALS } from './analysis.js';

export class TrellisBuilder {
  constructor(scene) {
    this.scene = scene;
    this.frameGroup = new THREE.Group();
    this.scene.add(this.frameGroup);

    this.params = {
      tubeRadius: 0.025,
      headstockHeight: 1.2,
      pivotWidth: 0.6,
      chassisLength: 1.6,
      materialKey: 'chromoly'
    };
  }

  buildChassis() {
    while (this.frameGroup.children.length > 0) {
      const obj = this.frameGroup.children[0];
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material?.dispose();
      }
      this.frameGroup.remove(obj);
    }

    const matConfig = MATERIALS[this.params.materialKey] || MATERIALS.chromoly;

    // Material plano sin sombreado
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: matConfig.color,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    // Material para líneas de contorno (estilo plano técnico CAD)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x010409,
      linewidth: 1.5
    });

    const createTube = (p1, p2) => {
      const distance = p1.distanceTo(p2);
      const geom = new THREE.CylinderGeometry(
        this.params.tubeRadius,
        this.params.tubeRadius,
        distance,
        12
      );
      
      const mesh = new THREE.Mesh(geom, tubeMaterial);

      // Agregar contorno para definir la estructura sin depender de luces
      const edgesGeom = new THREE.EdgesGeometry(geom, 30);
      const wireframe = new THREE.LineSegments(edgesGeom, lineMaterial);
      mesh.add(wireframe);

      const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mesh.position.copy(midpoint);

      const orientation = new THREE.Matrix4();
      orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
      mesh.quaternion.setFromRotationMatrix(orientation);
      mesh.rotation.x += Math.PI / 2;

      this.frameGroup.add(mesh);
    };

    const h = this.params.headstockHeight / 2;
    const w = this.params.pivotWidth / 2;
    const l = this.params.chassisLength;

    const headTop = new THREE.Vector3(0, h, 0);
    const headBot = new THREE.Vector3(0, -h, 0);

    const pivotTopL = new THREE.Vector3(-l, h * 0.5, w);
    const pivotTopR = new THREE.Vector3(-l, h * 0.5, -w);
    const pivotBotL = new THREE.Vector3(-l, -h * 0.5, w);
    const pivotBotR = new THREE.Vector3(-l, -h * 0.5, -w);

    createTube(headTop, pivotTopL);
    createTube(headTop, pivotTopR);
    createTube(headBot, pivotBotL);
    createTube(headBot, pivotBotR);

    createTube(pivotTopL, pivotTopR);
    createTube(pivotBotL, pivotBotR);
    createTube(pivotTopL, pivotBotL);
    createTube(pivotTopR, pivotBotR);

    createTube(headTop, pivotBotL);
    createTube(headTop, pivotBotR);
    createTube(headBot, pivotTopL);
    createTube(headBot, pivotTopR);
  }
}
