/**
 * ProteoBuild — rotatable teaching model.
 *
 * Loaded on demand by app.js. Because app.js only ever imports this file
 * dynamically, a blocked or unreachable CDN rejects that promise instead of
 * taking down the whole page, and the app falls back to its static artwork.
 *
 * Nothing here computes a real fold: the chain is a scripted curve and the
 * violet coils simply mark "packed regions".
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const QUALITY = { low: 40, medium: 82, high: 160 };
const BASE_COUNT = 82;

const LIGHT_BG = '#f4f3ed';
const DARK_BG = '#171a1e';

function residuePosition(i, n) {
  const t = (i / n) * Math.PI * 5.4;
  const yStep = 0.095 * (BASE_COUNT / n); // keep the chain the same height at every quality
  return new THREE.Vector3(
    Math.cos(t) * (0.8 + 0.22 * Math.sin(t * 2)),
    (i - n / 2) * yStep + Math.sin(t * 1.7) * 0.19,
    Math.sin(t) * (0.8 + 0.22 * Math.sin(t * 2))
  );
}

function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => m.dispose());
    }
  });
}

/**
 * @param {HTMLElement} container
 * @param {{theme?: 'light'|'dark', quality?: 'low'|'medium'|'high', reducedMotion?: boolean, subunits?: boolean}} options
 */
export function createViewer(container, options = {}) {
  const theme = options.theme || 'light';
  const reducedMotion = Boolean(options.reducedMotion);
  let quality = QUALITY[options.quality] ? options.quality : 'medium';
  let showSubunits = Boolean(options.subunits);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(theme === 'dark' ? DARK_BG : LIGHT_BG);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(3.7, 2.4, 4.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = theme === 'dark' ? 1.05 : 1.25;
  container.prepend(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d1c4, 2.0));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 5, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe6d8fa, 1.2);
  fill.position.set(-4, -1, 3);
  scene.add(fill);

  const chainGroup = new THREE.Group();
  const subunitGroup = new THREE.Group();
  scene.add(chainGroup, subunitGroup);

  function makeChain(offset = 0, scale = 1) {
    const group = new THREE.Group();
    group.position.x = offset;
    group.scale.setScalar(scale);

    const count = QUALITY[quality];
    const points = [];
    for (let i = 0; i < count; i++) points.push(residuePosition(i, count));

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeSegments = Math.round(count * 3.2);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, tubeSegments, 0.072, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xd99572, roughness: 0.52 })
    );
    group.add(tube);

    const beadGeo = new THREE.SphereGeometry(0.105, 14, 12);
    points.forEach((p, i) => {
      const bead = new THREE.Mesh(
        beadGeo,
        new THREE.MeshStandardMaterial({ color: i % 7 === 0 ? 0xb29bc9 : 0xe5a17e, roughness: 0.46 })
      );
      bead.position.copy(p);
      group.add(bead);
    });

    // Soft violet coils suggest local packed regions without claiming a computed fold.
    [0.17, 0.475, 0.76].forEach((fraction, j) => {
      const center = Math.round(fraction * (count - 1));
      const start = Math.max(0, center - Math.round(count * 0.085));
      const end = Math.min(count - 1, center + Math.round(count * 0.085));
      const local = [];
      for (let i = start; i <= end; i++) {
        local.push(points[i].clone().add(new THREE.Vector3((j - 1) * 0.12, 0.08, 0)));
      }
      const accent = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(local), 60, 0.09, 8, false),
        new THREE.MeshStandardMaterial({ color: 0xb29bc9, roughness: 0.42 })
      );
      group.add(accent);
    });

    return group;
  }

  function rebuild() {
    disposeObject(chainGroup);
    disposeObject(subunitGroup);
    chainGroup.clear();
    subunitGroup.clear();

    chainGroup.add(makeChain());
    subunitGroup.add(makeChain(-0.9, 0.68));
    subunitGroup.add(makeChain(0.9, 0.68));

    chainGroup.visible = !showSubunits;
    subunitGroup.visible = showSubunits;
  }
  rebuild();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.5;
  controls.maxDistance = 8;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.55;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  let raf = 0;
  function animate() {
    raf = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return {
    resize,

    reset() {
      camera.position.set(3.7, 2.4, 4.4);
      controls.target.set(0, 0, 0);
      controls.update();
    },

    setSubunits(show) {
      showSubunits = Boolean(show);
      chainGroup.visible = !showSubunits;
      subunitGroup.visible = showSubunits;
    },

    setQuality(level) {
      if (!QUALITY[level] || level === quality) return;
      quality = level;
      rebuild();
    },

    setTheme(next) {
      const dark = next === 'dark';
      scene.background = new THREE.Color(dark ? DARK_BG : LIGHT_BG);
      renderer.toneMappingExposure = dark ? 1.05 : 1.25;
    },

    setReducedMotion(reduced) {
      controls.autoRotate = !reduced;
    },

    screenshot(onDone) {
      renderer.render(scene, camera); // draw immediately so the buffer is current
      renderer.domElement.toBlob((blob) => onDone(blob), 'image/png');
    },

    dispose() {
      cancelAnimationFrame(raf);
      controls.dispose();
      disposeObject(chainGroup);
      disposeObject(subunitGroup);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
