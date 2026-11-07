/**
 * SketchUp Интерактивті Шеберхана Симуляторы
 * Push/Pull, Orbit, Move, Rotate, Scale, Paint құралдарының жұмыс істеу принципі
 */

const SketchUpSim = {
  activeTool: 'pushpull',
  currentColor: 0x0288d1,
  meshHeight: 1.0,
  targetMesh: null,
  sceneData: null,

  init() {
    const container = document.getElementById('sketchup-viewport');
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3.5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // SketchUp стиліндегі жарықтандыру
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // SketchUp танымал X, Y, Z түрлі-түсті осьтері (Қызыл - Red Axis, Жасыл - Green Axis, Көк - Blue Axis)
    const axesGroup = new THREE.Group();
    // Blue axis (Z-up in SketchUp, but Y-up in Three.js)
    const blueLine = this.createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0), 0x1976d2);
    // Red axis (X)
    const redLine = this.createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0), 0xd32f2f);
    // Green axis (Z)
    const greenLine = this.createAxisLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 5), 0x388e3c);
    axesGroup.add(blueLine, redLine, greenLine);
    scene.add(axesGroup);

    // SketchUp стиліндегі тор жазықтығы
    const grid = new THREE.GridHelper(10, 20, 0x94a3b8, 0xe2e8f0);
    scene.add(grid);

    // Негізгі модель: Бастапқыда жазық тіктөртбұрыштан өсірілетін көлем
    const baseGeo = new THREE.BoxGeometry(2, this.meshHeight, 2);
    baseGeo.translate(0, this.meshHeight / 2, 0); // Табаны нөлдік жазықтықта болуы үшін

    const baseMat = new THREE.MeshStandardMaterial({
      color: this.currentColor,
      roughness: 0.3,
      metalness: 0.1
    });

    this.targetMesh = new THREE.Mesh(baseGeo, baseMat);
    this.targetMesh.castShadow = true;
    this.targetMesh.receiveShadow = true;

    // Жиектерін қара түспен сызу (SketchUp Edge style)
    const edges = new THREE.EdgesGeometry(baseGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0f172a, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    this.targetMesh.add(wireframe);
    this.targetWireframe = wireframe;

    scene.add(this.targetMesh);

    // Камера басқару (Orbit)
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 - 0.02; // Еденнің астына түсіп кетпеу
    }

    this.sceneData = { scene, camera, renderer, controls };

    const animate = () => {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });

    this.updateToolStatus();
  },

  createAxisLine(start, end, colorHex) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 3 });
    return new THREE.Line(geo, mat);
  },

  selectTool(toolName) {
    this.activeTool = toolName;
    if (window.sounds) window.sounds.playClick();

    document.querySelectorAll('.sketch-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === toolName);
    });

    this.updateToolStatus();
  },

  updateToolStatus() {
    const statusText = document.getElementById('sketch-tool-info');
    if (!statusText) return;

    const descriptions = {
      pushpull: '📌 Push/Pull (Басу/Тарту): Төмендегі биіктік сырғытпасын тартып, нысанды жоғары қарай көтеріңіз немесе басыңыз.',
      orbit: '🔄 Orbit (Орбита): Тінтуірдің сол жақ батырмасымен 3D кеңістікті 360° еркін айналдырып көріңіз.',
      paint: '🎨 Paint Bucket (Бояу шелегі): Оң жақтан түс таңдап, нысанды бояңыз.',
      move: '↔️ Move (Жылжыту): Нысанды қызыл, жасыл немесе көк осьтер бойымен орын ауыстырыңыз.',
      scale: '📐 Scale (Өлшемін өзгерту): Нысанды пропорционалды үлкейтіп немесе кішірейтіңіз.',
      rotate: '🔁 Rotate (Бұру): Нысанды өз осі бойынша бұрыңыз.'
    };

    statusText.innerText = descriptions[this.activeTool] || 'Құрал таңдалды';
  },

  // Push/Pull әсері: Биіктігін өсіру
  setHeight(h) {
    this.meshHeight = parseFloat(h);
    if (!this.targetMesh) return;

    this.targetMesh.scale.y = this.meshHeight;
    this.targetMesh.position.y = 0; // translation арқылы табан тегіс қалады

    const hLabel = document.getElementById('val-height');
    if (hLabel) hLabel.innerText = this.meshHeight.toFixed(1) + ' м';

    if (window.sounds) window.sounds.playTransform();
  },

  // Move әсері
  setPositionX(x) {
    if (!this.targetMesh) return;
    this.targetMesh.position.x = parseFloat(x);
    const xLabel = document.getElementById('val-pos-x');
    if (xLabel) xLabel.innerText = x + ' м';
  },

  // Scale әсері
  setScaleXZ(s) {
    if (!this.targetMesh) return;
    const val = parseFloat(s);
    this.targetMesh.scale.x = val;
    this.targetMesh.scale.z = val;
    const sLabel = document.getElementById('val-scale');
    if (sLabel) sLabel.innerText = Math.round(val * 100) + '%';
  },

  // Rotate әсері
  setRotationY(deg) {
    if (!this.targetMesh) return;
    this.targetMesh.rotation.y = (parseFloat(deg) * Math.PI) / 180;
    const rLabel = document.getElementById('val-rot');
    if (rLabel) rLabel.innerText = deg + '°';
  },

  // Paint әсері: Түсін өзгерту
  setColor(hexColor) {
    this.currentColor = hexColor;
    if (this.targetMesh && this.targetMesh.material) {
      this.targetMesh.material.color.setHex(hexColor);
    }
    if (window.sounds) window.sounds.playClick();
  },

  // Модельді бастапқы қалпына келтіру
  resetModel() {
    if (!this.targetMesh) return;
    this.meshHeight = 1.0;
    this.targetMesh.scale.set(1, 1, 1);
    this.targetMesh.position.set(0, 0, 0);
    this.targetMesh.rotation.set(0, 0, 0);
    this.setColor(0x0288d1);

    // Сырғытпаларды жаңарту
    const hSlider = document.getElementById('slider-height');
    if (hSlider) hSlider.value = 1.0;
    const hLabel = document.getElementById('val-height');
    if (hLabel) hLabel.innerText = '1.0 м';

    const xSlider = document.getElementById('slider-pos-x');
    if (xSlider) xSlider.value = 0;
    const xLabel = document.getElementById('val-pos-x');
    if (xLabel) xLabel.innerText = '0 м';

    const sSlider = document.getElementById('slider-scale');
    if (sSlider) sSlider.value = 1.0;
    const sLabel = document.getElementById('val-scale');
    if (sLabel) sLabel.innerText = '100%';

    const rSlider = document.getElementById('slider-rot');
    if (rSlider) rSlider.value = 0;
    const rLabel = document.getElementById('val-rot');
    if (rLabel) rLabel.innerText = '0°';

    if (this.sceneData && this.sceneData.camera) {
      this.sceneData.camera.position.set(4, 3.5, 5);
      if (this.sceneData.controls) this.sceneData.controls.reset();
    }

    if (window.sounds) window.sounds.playCorrect();
  }
};

window.SketchUpSim = SketchUpSim;
