/**
 * ProteoBuild - Module 3: Interactive 3D Protein Structure Viewer (Three.js)
 * Implements an illustrative 3D teaching model showing Tertiary and Quaternary arrangements,
 * subunit assemblies, cartoon ribbons, and dynamic non-covalent force networks.
 *
 * NOTE: Explicitly labeled as a simplified educational model. Does not perform
 * physical molecular-dynamics or sequence-to-structure ab-initio prediction.
 */

// We import Three.js and OrbitControls dynamically or from window if loaded via script tag
let THREE = window.THREE;
let OrbitControls = window.OrbitControls;

export class ProteinViewer3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.container = this.canvas ? this.canvas.parentElement : null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.modelGroup = null;
    this.forceLinesGroup = null;
    this.hydrophobicCoreGroup = null;

    // View state
    this.currentPreset = 'myoglobin';
    this.assemblyType = 'monomer'; // 'monomer' | 'dimer' | 'tetramer'
    this.styleMode = 'cartoon'; // 'cartoon' | 'tube' | 'atoms'
    this.showHBonds = true;
    this.showDisulfides = true;
    this.showSaltBridges = true;
    this.showHydrophobicCore = true;
    this.autoRotate = true;

    this.activeSequence = '';
    this.activeProteinName = 'Myoglobin (Segment)';

    this.animationFrameId = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    if (!this.canvas) return;

    try {
      // Ensure Three.js and OrbitControls are loaded
      if (!window.THREE) {
        await this.loadThreeCDN();
      } else {
        THREE = window.THREE;
        OrbitControls = window.OrbitControls;
      }

      this.setupScene();
      this.setupLighting();
      this.setupControls();
      this.bindUI();
      this.buildModel();
      this.animate();
      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize Three.js viewer:', err);
      this.showFallbackMessage(err.message);
    }
  }

  async loadThreeCDN() {
    return new Promise((resolve, reject) => {
      // Load Three.js r128 or modern CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => {
        THREE = window.THREE;
        const controlsScript = document.createElement('script');
        controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
        controlsScript.onload = () => {
          OrbitControls = THREE.OrbitControls;
          resolve();
        };
        controlsScript.onerror = () => reject(new Error('Could not load OrbitControls'));
        document.head.appendChild(controlsScript);
      };
      script.onerror = () => reject(new Error('Could not load Three.js from CDN (check internet connection).'));
      document.head.appendChild(script);
    });
  }

  showFallbackMessage(msg) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="webgl-fallback-card">
        <h4>3D Visualization Offline Notice</h4>
        <p>The interactive 3D teaching model requires WebGL and an active internet connection to load Three.js from CDN.</p>
        <p class="text-muted"><small>Details: ${msg}</small></p>
        <button type="button" class="btn btn-outline btn-sm" onclick="location.reload()">Retry Loading</button>
      </div>
    `;
  }

  setupScene() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(document.documentElement.getAttribute('data-theme') === 'dark' ? 0x0f172a : 0xf8fafc);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 15, 65);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.modelGroup = new THREE.Group();
    this.forceLinesGroup = new THREE.Group();
    this.hydrophobicCoreGroup = new THREE.Group();

    this.scene.add(this.modelGroup);
    this.scene.add(this.forceLinesGroup);
    this.scene.add(this.hydrophobicCoreGroup);

    // Resize handler
    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
    mainLight.position.set(25, 40, 35);
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.45);
    fillLight.position.set(-25, -20, -25);
    this.scene.add(fillLight);

    const softPointLight = new THREE.PointLight(0xffedd5, 0.5, 100);
    softPointLight.position.set(0, 0, 20);
    this.scene.add(softPointLight);
  }

  setupControls() {
    const ControlsConstructor = window.THREE.OrbitControls || OrbitControls;
    if (ControlsConstructor) {
      this.controls = new ControlsConstructor(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 150;
      this.controls.minDistance = 15;
      this.controls.autoRotate = this.autoRotate;
      this.controls.autoRotateSpeed = 1.0;
    }
  }

  bindUI() {
    // Subunit assembly toggle buttons
    const assemblyBtns = document.querySelectorAll('.assembly-btn');
    assemblyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        assemblyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.assemblyType = btn.dataset.assembly;
        this.buildModel();
      });
    });

    // Style mode dropdown/buttons
    const styleBtns = document.querySelectorAll('.viewer-style-btn');
    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        styleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.styleMode = btn.dataset.style;
        this.buildModel();
      });
    });

    // Force line toggles
    const hBondCheck = document.getElementById('toggle-3d-hbonds');
    if (hBondCheck) {
      hBondCheck.addEventListener('change', (e) => {
        this.showHBonds = e.target.checked;
        this.forceLinesGroup.visible = this.showHBonds;
      });
    }

    const disulfideCheck = document.getElementById('toggle-3d-disulfides');
    if (disulfideCheck) {
      disulfideCheck.addEventListener('change', (e) => {
        this.showDisulfides = e.target.checked;
        this.buildModel();
      });
    }

    const coreCheck = document.getElementById('toggle-3d-hydrophobic');
    if (coreCheck) {
      coreCheck.addEventListener('change', (e) => {
        this.showHydrophobicCore = e.target.checked;
        this.hydrophobicCoreGroup.visible = this.showHydrophobicCore;
      });
    }

    // Auto rotate toggle
    const rotateCheck = document.getElementById('toggle-3d-autorotate');
    if (rotateCheck) {
      rotateCheck.addEventListener('change', (e) => {
        this.autoRotate = e.target.checked;
        if (this.controls) this.controls.autoRotate = this.autoRotate;
      });
    }

    // Reset View button
    const resetBtn = document.getElementById('btn-3d-reset-view');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetCamera());
    }

    // Preset selector dropdown
    const presetSelect = document.getElementById('preset-protein-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        this.loadPreset(e.target.value);
      });
    }

    // Watch theme changes
    const observer = new MutationObserver(() => {
      if (this.scene) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.scene.background = new THREE.Color(isDark ? 0x0f172a : 0xf8fafc);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  resetCamera() {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(0, 15, 65);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  loadPreset(presetKey) {
    this.currentPreset = presetKey;
    if (presetKey === 'myoglobin') {
      this.assemblyType = 'monomer';
      this.activeProteinName = 'Myoglobin (Monomer)';
    } else if (presetKey === 'hemoglobin') {
      this.assemblyType = 'tetramer';
      this.activeProteinName = 'Hemoglobin Tetramer (α2β2)';
    } else if (presetKey === 'insulin') {
      this.assemblyType = 'dimer';
      this.activeProteinName = 'Insulin (A/B Subunits)';
    } else if (presetKey === 'lysozyme') {
      this.assemblyType = 'monomer';
      this.activeProteinName = 'Lysozyme (Enzyme with Disulfides)';
    }

    // Sync assembly buttons
    const assemblyBtns = document.querySelectorAll('.assembly-btn');
    assemblyBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.assembly === this.assemblyType);
    });

    this.buildModel();
    this.updateInfoPanel();
  }

  setCustomSequence(seq, name = 'Custom Sequence') {
    this.activeSequence = seq;
    this.activeProteinName = name;
    this.updateInfoPanel(true);
    this.buildModel();
  }

  updateInfoPanel(isCustom = false) {
    const titleEl = document.getElementById('viewer-protein-title');
    const descEl = document.getElementById('viewer-protein-desc');
    const seqEl = document.getElementById('viewer-linked-seq');

    if (titleEl) titleEl.textContent = this.activeProteinName;
    if (descEl) {
      if (isCustom) {
        descEl.innerHTML = `
          <strong>Displaying custom sequence from Sequence Builder.</strong><br>
          <em class="disclaimer-text">Educational note: The 3D geometry shown is an illustrative ribbon representation. ProteoBuild does not predict atomic coordinates from sequences.</em>
        `;
      } else if (this.assemblyType === 'tetramer') {
        descEl.innerHTML = `
          <strong>Quaternary Allosteric Complex (4 Subunits):</strong> Demonstrates spatial assembly of four separate polypeptide chains (Subunits α1, α2 in Coral/Amber; Subunits β1, β2 in Lavender/Blue).
        `;
      } else if (this.assemblyType === 'dimer') {
        descEl.innerHTML = `
          <strong>Quaternary Dimer:</strong> Demonstrates two distinct polypeptide chains interacting across a specific non-covalent interface.
        `;
      } else {
        descEl.innerHTML = `
          <strong>Tertiary Single-Chain Globule:</strong> Illustrates the 3D folded architecture of a single polypeptide chain stabilized by a central hydrophobic core.
        `;
      }
    }

    if (seqEl) {
      seqEl.textContent = this.activeSequence || (this.currentPreset === 'myoglobin' ? 'VLSEGEWQLVLHVWAKVEADVAGHGQDILIRLFKSHPETLEKFDRFKHLKTEAEMKASEDLKKHGVTVLTALGAILKKKGHHEAELKPLAQSHATKHKIPIKYLEFISEAIIHVLHSRHPGDFGADAQGAMNKALELFRKDIAAKYKELGYQG' : 'Custom / Preset Sequence Active');
    }
  }

  /**
   * Procedural generation of illustrative protein structural geometry
   */
  buildModel() {
    if (!this.modelGroup) return;

    // Clear existing meshes
    while (this.modelGroup.children.length > 0) {
      const obj = this.modelGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      this.modelGroup.remove(obj);
    }
    while (this.forceLinesGroup.children.length > 0) {
      const obj = this.forceLinesGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      this.forceLinesGroup.remove(obj);
    }
    while (this.hydrophobicCoreGroup.children.length > 0) {
      const obj = this.hydrophobicCoreGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      this.hydrophobicCoreGroup.remove(obj);
    }

    // Determine subunits to build
    const subunitConfigs = [];

    if (this.assemblyType === 'monomer') {
      subunitConfigs.push({
        name: 'Chain A',
        color: 0xE07A5F, // Coral
        offset: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: 1.0
      });
    } else if (this.assemblyType === 'dimer') {
      subunitConfigs.push(
        {
          name: 'Subunit α',
          color: 0xE07A5F, // Coral
          offset: new THREE.Vector3(-10, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: 0.95
        },
        {
          name: 'Subunit β',
          color: 0x6A4C93, // Lavender
          offset: new THREE.Vector3(10, 0, 0),
          rotation: new THREE.Euler(0, Math.PI, 0.2),
          scale: 0.95
        }
      );
    } else {
      // Tetramer (Hemoglobin-like α2β2)
      subunitConfigs.push(
        {
          name: 'Subunit α1',
          color: 0xE07A5F, // Coral
          offset: new THREE.Vector3(-11, 7, -5),
          rotation: new THREE.Euler(0, 0.3, 0),
          scale: 0.85
        },
        {
          name: 'Subunit α2',
          color: 0xF4A261, // Light Orange/Amber
          offset: new THREE.Vector3(11, -7, 5),
          rotation: new THREE.Euler(0, -0.3, Math.PI),
          scale: 0.85
        },
        {
          name: 'Subunit β1',
          color: 0x6A4C93, // Royal Lavender
          offset: new THREE.Vector3(11, 7, -5),
          rotation: new THREE.Euler(0.2, Math.PI, 0),
          scale: 0.85
        },
        {
          name: 'Subunit β2',
          color: 0x3D5A80, // Slate Blue
          offset: new THREE.Vector3(-11, -7, 5),
          rotation: new THREE.Euler(-0.2, 0, Math.PI),
          scale: 0.85
        }
      );
    }

    subunitConfigs.forEach((config, idx) => {
      this.generateSubunitGeometry(config, idx);
    });

    // Add Hydrophobic Core representation for monomer or assembly
    if (this.showHydrophobicCore) {
      this.generateHydrophobicCore(subunitConfigs);
    }

    // Add inter-subunit interface force lines for quaternary
    if (this.assemblyType !== 'monomer' && this.showHBonds) {
      this.generateQuaternaryInterfaceForces();
    }
  }

  generateSubunitGeometry(config, subunitIdx) {
    const subGroup = new THREE.Group();
    subGroup.position.copy(config.offset);
    subGroup.rotation.copy(config.rotation);
    subGroup.scale.setScalar(config.scale);

    // Create a smooth spline trajectory with multiple alpha-helices and beta-loops
    const points = [
      new THREE.Vector3(-14, -8, 2),
      new THREE.Vector3(-12, -4, 5),
      new THREE.Vector3(-8, 3, 7),
      new THREE.Vector3(-4, 9, 3), // Helix 1
      new THREE.Vector3(2, 11, -2),
      new THREE.Vector3(8, 7, -6),
      new THREE.Vector3(11, 2, -4), // Loop turn
      new THREE.Vector3(9, -6, 2),
      new THREE.Vector3(4, -10, 6), // Helix 2
      new THREE.Vector3(-3, -11, 4),
      new THREE.Vector3(-9, -8, -1),
      new THREE.Vector3(-6, -2, -8),
      new THREE.Vector3(0, 4, -9), // Beta-hairpin
      new THREE.Vector3(7, -1, -5),
      new THREE.Vector3(12, -5, 0),
      new THREE.Vector3(6, -8, 7),
      new THREE.Vector3(-1, -7, 10),
      new THREE.Vector3(-8, -4, 8)
    ];

    const curve = new THREE.CatmullRomCurve3(points, true);

    if (this.styleMode === 'cartoon') {
      // Tube with helical thickness variation
      const tubeGeo = new THREE.TubeGeometry(curve, 160, 1.4, 12, true);
      const mat = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.35,
        metalness: 0.15,
        wireframe: false
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, mat);
      subGroup.add(tubeMesh);

      // Add pleated beta-arrow ribbons along segments
      const arrowGeo = new THREE.ConeGeometry(2.4, 4.5, 5);
      const arrowMat = new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.3 });
      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
      arrowMesh.position.set(7, -1, -5);
      arrowMesh.rotation.set(0.5, 0.8, -0.4);
      subGroup.add(arrowMesh);

    } else if (this.styleMode === 'tube') {
      // Smooth continuous backbone tube
      const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.7, 8, true);
      const mat = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.4
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, mat);
      subGroup.add(tubeMesh);

      // Alpha carbon spheres
      const sphereGeo = new THREE.SphereGeometry(1.0, 10, 10);
      const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      points.forEach(pt => {
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.copy(pt);
        subGroup.add(sphere);
      });

    } else {
      // Space-filling / Atomic balls
      const atomSphereGeo = new THREE.SphereGeometry(1.6, 12, 12);
      const curvePoints = curve.getPoints(50);
      curvePoints.forEach((pt, i) => {
        const atomMat = new THREE.MeshStandardMaterial({
          color: (i % 3 === 0) ? config.color : (i % 3 === 1 ? 0x81B29A : 0x3D5A80),
          roughness: 0.35
        });
        const mesh = new THREE.Mesh(atomSphereGeo, atomMat);
        mesh.position.copy(pt);
        subGroup.add(mesh);
      });
    }

    // Intra-subunit Hydrogen Bonds (dotted lines)
    if (this.showHBonds) {
      const hBondPairs = [
        [points[2], points[5]],
        [points[3], points[6]],
        [points[7], points[10]],
        [points[8], points[11]],
        [points[12], points[15]]
      ];

      hBondPairs.forEach(([p1, p2]) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineDashedMaterial({
          color: 0xffb703,
          dashSize: 0.8,
          gapSize: 0.4,
          linewidth: 2
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        subGroup.add(line);
      });
    }

    // Disulfide bridge (covalent cystine connection)
    if (this.showDisulfides && (this.currentPreset === 'insulin' || this.currentPreset === 'lysozyme')) {
      const c1 = points[1];
      const c2 = points[9];
      const mid = new THREE.Vector3().addVectors(c1, c2).multiplyScalar(0.5);
      const dist = c1.distanceTo(c2);

      const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, dist, 8);
      const cylinderMat = new THREE.MeshStandardMaterial({
        color: 0xffd166,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x553300
      });
      const bridge = new THREE.Mesh(cylinderGeo, cylinderMat);
      bridge.position.copy(mid);
      bridge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c2.clone().sub(c1).normalize());
      subGroup.add(bridge);

      // Cysteine sulfur spheres
      const sGeo = new THREE.SphereGeometry(0.9, 10, 10);
      const sMat = new THREE.MeshStandardMaterial({ color: 0xffd166 });
      const s1 = new THREE.Mesh(sGeo, sMat);
      s1.position.copy(c1);
      const s2 = new THREE.Mesh(sGeo, sMat);
      s2.position.copy(c2);
      subGroup.add(s1);
      subGroup.add(s2);
    }

    this.modelGroup.add(subGroup);
  }

  generateHydrophobicCore(subunits) {
    // Illustrative glowing translucent core showing hydrophobic collapse
    const coreGeo = new THREE.SphereGeometry(this.assemblyType === 'monomer' ? 6.5 : 9.5, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      roughness: 0.7,
      transparent: true,
      opacity: 0.22,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0, 0);
    this.hydrophobicCoreGroup.add(coreMesh);
  }

  generateQuaternaryInterfaceForces() {
    // Add glowing inter-subunit salt bridges / hydrogen bonds across interface
    const p1 = new THREE.Vector3(-4, 2, 0);
    const p2 = new THREE.Vector3(4, 2, 0);
    const p3 = new THREE.Vector3(-3, -3, 2);
    const p4 = new THREE.Vector3(3, -3, 2);

    const pairs = [[p1, p2], [p3, p4]];
    pairs.forEach(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
      const mat = new THREE.LineDashedMaterial({
        color: 0x81b29a,
        dashSize: 0.6,
        gapSize: 0.4
      });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      this.forceLinesGroup.add(line);
    });
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
