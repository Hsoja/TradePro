import * as THREE from 'three';
const $ = (id) => document.getElementById(id);
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    /* ============ 1. FONDO 3D: túnel de velas por el que vuela la cámara ============ */
    const canvas = $('bg');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x070a10, 8, 55);
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);

    const N = 220, m4 = new THREE.Matrix4(), col = new THREE.Color();
    const candles3d = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55 }), N);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 9, h = 0.6 + Math.random() * 3;
      m4.compose(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -i * 0.7 - Math.random()),
        new THREE.Quaternion(), new THREE.Vector3(0.16, h, 0.16));
      candles3d.setMatrixAt(i, m4);
      candles3d.setColorAt(i, col.set(Math.random() > 0.42 ? 0x2ee6a6 : 0xff5d6c));
    }
    scene.add(candles3d);

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6ee7f9, transparent: true, opacity: 0.3 });
    const ringGeo = new THREE.TorusGeometry(4.5, 0.018, 6, 100);
    for (let i = 0; i < 13; i++) { const r = new THREE.Mesh(ringGeo, ringMat); r.position.z = -i * 12; scene.add(r); }

    const pos = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) { pos[i*3] = (Math.random()-.5)*40; pos[i*3+1] = (Math.random()-.5)*40; pos[i*3+2] = 5 - Math.random()*165; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.07, color: 0x6ee7f9, transparent: true, opacity: 0.7 })));

    let sp = 0, spT = 0, mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight * 2 - 1); });
    addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

    
function frame() {
  requestAnimationFrame(frame);
  const k = rm ? 1 : 0.07;
  spT = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  sp += (spT - sp) * k; tx += (mx - tx) * k; ty += (my - ty) * k;
  camera.position.set(tx * 0.8, ty * 0.5, -sp * 140);
  camera.rotation.z = sp * 1.2;
  camera.rotation.y = -tx * 0.05;
  renderer.render(scene, camera);
}
frame();
