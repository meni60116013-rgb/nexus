import * as THREE from 'three';

export default class CADVectorialEngine {
  crearChasisTubular() {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });

    // Estructura tubular superior (Curva paramétrica)
    const pathSuperior = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2, 0.2, 0),
      new THREE.Vector3(-0.8, 1.1, 0),
      new THREE.Vector3(0.8, 1.1, 0),
      new THREE.Vector3(2, 0.2, 0)
    ]);
    const tubeGeometry1 = new THREE.TubeGeometry(pathSuperior, 24, 0.08, 8, false);
    const tubeMesh1 = new THREE.Mesh(tubeGeometry1, material);
    group.add(tubeMesh1);

    // Cuna inferior del chasis
    const pathInferior = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, 0, 0),
      new THREE.Vector3(-1.0, -0.8, 0),
      new THREE.Vector3(1.0, -0.8, 0),
      new THREE.Vector3(1.8, 0, 0)
    ]);
    const tubeGeometry2 = new THREE.TubeGeometry(pathInferior, 24, 0.08, 8, false);
    const tubeMesh2 = new THREE.Mesh(tubeGeometry2, material);
    group.add(tubeMesh2);

    // Travesaños de refuerzo
    const refuerzos = [-0.8, 0, 0.8];
    refuerzos.forEach((x) => {
      const geometryBarra = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8);
      const barra = new THREE.Mesh(geometryBarra, material);
      barra.position.set(x, 0.1, 0);
      group.add(barra);
    });

    return group;
  }
}
