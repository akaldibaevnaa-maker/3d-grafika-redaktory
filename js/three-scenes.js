/**
 * Three.js интерактивті 3D визуализация жүйесі
 * "Үш өлшемді графика редакторы" 7-сынып
 */

const ThreeScenes = {
  scenes: {},

  // Әмбебап сахна құру көмекшісі
  setupBasicScene(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(options.bgColor || 0xf8fafc);

    const camera = new THREE.PerspectiveCamera(
      options.fov || 45,
      width / height,
      0.1,
      1000
    );
    camera.position.set(
      options.camX || 0,
      options.camY || 2,
      options.camZ || 5
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Жарықтандыру
    const ambientLight = new THREE.AmbientLight(0xffffff, options.ambientIntensity || 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, options.dirIntensity || 0.95);
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x80d8ff, 0.6);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);

    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxDistance = 20;
      controls.minDistance = 1.2;
    }

    const sceneData = {
      container,
      scene,
      camera,
      renderer,
      controls,
      objects: {},
      isAnimating: true
    };

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

    return sceneData;
  },

  /* ==========================================================================
     1-Бөлім: 2D vs 3D Салыстыру
     ========================================================================== */
  init2Dvs3D() {
    // 2D Шаршы және Шеңбер (жазық)
    const scene2D = this.setupBasicScene('canvas-2d', { camZ: 4.5, bgColor: 0xf0f7ff });
    if (scene2D) {
      const group2D = new THREE.Group();

      const squareGeo = new THREE.PlaneGeometry(1.4, 1.4);
      const squareMat = new THREE.MeshBasicMaterial({ color: 0x1976d2, side: THREE.DoubleSide });
      const squareMesh = new THREE.Mesh(squareGeo, squareMat);
      squareMesh.position.set(-1.1, 0, 0);

      const circleGeo = new THREE.CircleGeometry(0.8, 32);
      const circleMat = new THREE.MeshBasicMaterial({ color: 0xe53935, side: THREE.DoubleSide });
      const circleMesh = new THREE.Mesh(circleGeo, circleMat);
      circleMesh.position.set(1.1, 0, 0);

      group2D.add(squareMesh, circleMesh);
      scene2D.scene.add(group2D);

      const anim = () => {
        requestAnimationFrame(anim);
        if (scene2D.controls) scene2D.controls.update();
        scene2D.renderer.render(scene2D.scene, scene2D.camera);
      };
      anim();
    }

    // 3D Текше және Шар
    const scene3D = this.setupBasicScene('canvas-3d', { camX: 2, camY: 2.5, camZ: 4.5, bgColor: 0xfff8f0 });
    if (scene3D) {
      const group3D = new THREE.Group();

      const cubeGeo = new THREE.BoxGeometry(1.3, 1.3, 1.3);
      const cubeMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.3, metalness: 0.2 });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.set(-1.2, 0, 0);
      cube.castShadow = true;

      const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.2, metalness: 0.1 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(1.2, 0, 0);
      sphere.castShadow = true;

      const axesHelper = new THREE.AxesHelper(1.8);
      axesHelper.position.set(0, -1.2, 0);
      group3D.add(axesHelper, cube, sphere);
      scene3D.scene.add(group3D);

      const anim = () => {
        requestAnimationFrame(anim);
        cube.rotation.x += 0.008;
        cube.rotation.y += 0.01;
        sphere.rotation.y += 0.012;
        if (scene3D.controls) scene3D.controls.update();
        scene3D.renderer.render(scene3D.scene, scene3D.camera);
      };
      anim();
    }

    // 3D Футбол добы
    const ballScene = this.setupBasicScene('canvas-soccer-ball', { camZ: 3.5, bgColor: 0xf5f5f5 });
    if (ballScene) {
      const ballGeo = new THREE.DodecahedronGeometry(1.2, 1);
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const ball = new THREE.Mesh(ballGeo, ballMat);

      const wireGeo = new THREE.DodecahedronGeometry(1.205, 1);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      ball.add(wire);

      ballScene.scene.add(ball);

      const anim = () => {
        requestAnimationFrame(anim);
        ball.rotation.y += 0.01;
        ball.rotation.x += 0.005;
        if (ballScene.controls) ballScene.controls.update();
        ballScene.renderer.render(ballScene.scene, ballScene.camera);
      };
      anim();
    }
  },

  /* ==========================================================================
     2-Бөлім: Негізгі 5 геометриялық пішін
     ========================================================================== */
  initShapes() {
    const shapes = [
      { id: 'canvas-cube', type: 'cube', color: 0x1e88e5 },
      { id: 'canvas-sphere', type: 'sphere', color: 0xe53935 },
      { id: 'canvas-cylinder', type: 'cylinder', color: 0x00acc1 },
      { id: 'canvas-cone', type: 'cone', color: 0xfb8c00 },
      { id: 'canvas-pyramid', type: 'pyramid', color: 0x8e24aa }
    ];

    shapes.forEach(item => {
      const s = this.setupBasicScene(item.id, { camZ: 3.8 });
      if (!s) return;

      let mesh;
      const mat = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.35, metalness: 0.15 });

      if (item.type === 'cube') mesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), mat);
      else if (item.type === 'sphere') mesh = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 32), mat);
      else if (item.type === 'cylinder') mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.8, 32), mat);
      else if (item.type === 'cone') mesh = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.9, 32), mat);
      else if (item.type === 'pyramid') mesh = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.8, 4), mat);

      mesh.castShadow = true;
      s.scene.add(mesh);

      const grid = new THREE.GridHelper(4, 8, 0xb0bec5, 0xe2e8f0);
      grid.position.y = -1.1;
      s.scene.add(grid);

      const anim = () => {
        requestAnimationFrame(anim);
        mesh.rotation.y += 0.01;
        if (s.controls) s.controls.update();
        s.renderer.render(s.scene, s.camera);
      };
      anim();
    });
  },

  /* ==========================================================================
     Робот Құрастыру Шеберханасы
     ========================================================================== */
  initRobotAssembly() {
    const s = this.setupBasicScene('canvas-robot-assembly', {
      camX: 0,
      camY: 2,
      camZ: 6.5,
      bgColor: 0xf1f8e9
    });
    if (!s) return;

    const robotGroup = new THREE.Group();
    s.scene.add(robotGroup);

    // 1. Денесі (Текше)
    const bodyGeo = new THREE.BoxGeometry(1.6, 1.8, 1.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.2;
    body.visible = true; // 1-қадам бірден ашық
    robotGroup.add(body);

    // 2. Басы (Шар)
    const headGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.65;
    head.visible = false;

    const eyeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.rotation.x = Math.PI / 2;
    eyeL.position.set(-0.28, 0.1, 0.65);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.28;
    head.add(eyeL, eyeR);

    const antGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xffb300 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.y = 0.9;
    const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffeb3b }));
    antTip.position.y = 0.25;
    ant.add(antTip);
    head.add(ant);
    robotGroup.add(head);

    // 3. Қолдары (Цилиндр)
    const armGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 16);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.4 });
    const armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(-1.2, 0.2, 0);
    armL.rotation.z = 0.3;
    armL.visible = false;

    const armR = new THREE.Mesh(armGeo, armMat);
    armR.position.set(1.2, 0.2, 0);
    armR.rotation.z = -0.3;
    armR.visible = false;
    robotGroup.add(armL, armR);

    // 4. Аяқтары (Цилиндр)
    const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0288d1 });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.5, -1.2, 0);
    legL.visible = false;

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.5, -1.2, 0);
    legR.visible = false;
    robotGroup.add(legL, legR);

    const floor = new THREE.GridHelper(6, 12, 0x81c784, 0xc8e6c9);
    floor.position.y = -1.8;
    s.scene.add(floor);

    this.robotParts = { body, head, armL, armR, legL, legR };

    const anim = () => {
      requestAnimationFrame(anim);
      robotGroup.rotation.y += 0.005;
      if (s.controls) s.controls.update();
      s.renderer.render(s.scene, s.camera);
    };
    anim();
  },

  setRobotStep(step) {
    if (!this.robotParts) return;
    const { body, head, armL, armR, legL, legR } = this.robotParts;

    if (step >= 1) body.visible = true;
    if (step >= 2) head.visible = true;
    if (step >= 3) { armL.visible = true; armR.visible = true; }
    if (step >= 4) { legL.visible = true; legR.visible = true; }

    if (window.sounds) window.sounds.playCorrect();
  },

  // "Қайтадан жасау" батырмасы
  resetRobot() {
    if (!this.robotParts) return;
    const { body, head, armL, armR, legL, legR } = this.robotParts;
    body.visible = true;
    head.visible = false;
    armL.visible = false;
    armR.visible = false;
    legL.visible = false;
    legR.visible = false;

    document.querySelectorAll('.assembly-steps-bar .step-btn').forEach((b, idx) => {
      b.classList.remove('active', 'completed');
      if (idx === 0) b.classList.add('active');
    });

    if (window.sounds) window.sounds.playClick();
  },

  /* ==========================================================================
     3-Бөлім: 3D МОДЕЛЬДЕН НАҚТЫ БҰЙЫМҒА ДЕЙІН (СЛАЙД 11)
     НАҚТЫ СУРЕТТЕГІДЕЙ "А" ӘРПІ 3D БРЕЛОГЫ (THREE.SHAPE & EXTRUDE)
     ========================================================================== */

  /**
   * Суреттегідей (media_1793634622389.png) мінсіз түзу әрі пропорционалды 3D "А" брелогы!
   * Төңкерілмеген, кері емес, дәл басып шығарылатын 3D үлгі.
   */
  createLetterAGroup(colorHex = 0x29b6f6) {
    const group = new THREE.Group();

    // 1. "А" әрпінің 2D пішіні (Shape)
    const shape = new THREE.Shape();

    // Төменгі сол табанның сырты
    shape.moveTo(-1.0, -1.1);
    // Төменгі сол табанның іші
    shape.lineTo(-0.42, -1.1);
    // Ортаңғы үшбұрышты аяқтар арасы ойығының төбесі
    shape.lineTo(0.0, -0.22);
    // Төменгі оң табанның іші
    shape.lineTo(0.42, -1.1);
    // Төменгі оң табанның сырты
    shape.lineTo(1.0, -1.1);
    // Жоғарғы оң жақ иық
    shape.lineTo(0.42, 1.05);
    // Жоғарғы жазық төбесі
    shape.lineTo(-0.42, 1.05);
    // Қайтадан төменгі сол табанға
    shape.closePath();

    // "А" әрпінің ортасындағы үшбұрышты тесік (Hole)
    const hole = new THREE.Path();
    hole.moveTo(-0.24, 0.12);
    hole.lineTo(0.24, 0.12);
    hole.lineTo(0.0, 0.68);
    hole.closePath();
    shape.holes.push(hole);

    // 3D Көлем беру (ExtrudeGeometry)
    const extrudeSettings = {
      steps: 1,
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 3
    };

    const letterGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    letterGeo.center(); // Центрін дәл ортаға қою

    // Көк түсті пластик материал
    const letterMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.22,
      metalness: 0.12
    });

    const letterMesh = new THREE.Mesh(letterGeo, letterMat);
    letterMesh.castShadow = true;
    letterMesh.receiveShadow = true;
    group.add(letterMesh);

    // 2. Жоғарғы сақиналы ілмек (Брелоктың дөңгелек тесігі)
    // Суреттегідей (media_1793634622389.png) "А" әрпінің үстіңгі жазық бетінде тік тұрған сақина
    const loopGeo = new THREE.TorusGeometry(0.28, 0.075, 16, 32);
    const loopMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.22,
      metalness: 0.12
    });
    const loopMesh = new THREE.Mesh(loopGeo, loopMat);
    loopMesh.position.set(0, 1.34, 0);
    loopMesh.castShadow = true;
    group.add(loopMesh);

    // 3. Суреттегідей әдемі көгілдір жылтыр неон жиектері (Chamfer edge highlight)
    const edges = new THREE.EdgesGeometry(letterGeo, 24);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x80d8ff, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    letterMesh.add(wireframe);

    return group;
  },

  // 1. 3D Принтердің тірі басу симуляторы
  initPrinterScene() {
    const s = this.setupBasicScene('canvas-3d-printer', {
      camX: 3.2,
      camY: 2.8,
      camZ: 5.2,
      bgColor: 0x1e293b
    });
    if (!s) return;

    const printerGroup = new THREE.Group();

    // Принтердің металл қаңқасы (Frame)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 16);
    const p1 = new THREE.Mesh(pillarGeo, frameMat); p1.position.set(-1.8, 0.9, -1.5);
    const p2 = new THREE.Mesh(pillarGeo, frameMat); p2.position.set(1.8, 0.9, -1.5);
    const p3 = new THREE.Mesh(pillarGeo, frameMat); p3.position.set(-1.8, 0.9, 1.5);
    const p4 = new THREE.Mesh(pillarGeo, frameMat); p4.position.set(1.8, 0.9, 1.5);

    const beamGeo = new THREE.BoxGeometry(3.7, 0.12, 0.12);
    const bTopFront = new THREE.Mesh(beamGeo, frameMat); bTopFront.position.set(0, 2.7, 1.5);
    const bTopBack = new THREE.Mesh(beamGeo, frameMat); bTopBack.position.set(0, 2.7, -1.5);
    printerGroup.add(p1, p2, p3, p4, bTopFront, bTopBack);

    // Қыздырылатын басу үстелі
    const bedBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.15, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    bedBase.position.y = -1.0;

    const bedGlass = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.05, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.1, transparent: true, opacity: 0.85 })
    );
    bedGlass.position.y = -0.9;
    printerGroup.add(bedBase, bedGlass);

    // Үстел торы (Grid)
    const bedGrid = new THREE.GridHelper(2.6, 12, 0x00e5ff, 0x03a9f4);
    bedGrid.position.y = -0.87;
    printerGroup.add(bedGrid);

    // Экструдер рельсі мен соплосы
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const xRail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 16), railMat);
    xRail.rotation.z = Math.PI / 2;
    xRail.position.set(0, 1.2, 0);

    const extruder = new THREE.Group();
    extruder.position.set(0, 1.2, 0);

    const extBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.45, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xd32f2f, metalness: 0.5, roughness: 0.3 })
    );

    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.8, roughness: 0.2 })
    );
    nozzle.rotation.x = Math.PI;
    nozzle.position.y = -0.3;

    const nozzleLight = new THREE.PointLight(0x00e5ff, 1.5, 1.5);
    nozzleLight.position.y = -0.42;

    extruder.add(extBody, nozzle, nozzleLight);
    printerGroup.add(xRail, extruder);

    // Басылып шығатын 3D "А" брелогы (суреттегідей түзу, дұрыс)
    const printItem = this.createLetterAGroup(0x03a9f4);
    printItem.position.set(0, -0.87, 0);
    printItem.scale.set(0.75, 0.01, 0.75); // Басында үстел бетінде
    printerGroup.add(printItem);

    s.scene.add(printerGroup);

    this.printerData = {
      extruder,
      xRail,
      printItem,
      isPrinting: false,
      progress: 0
    };

    let t = 0;
    const anim = () => {
      requestAnimationFrame(anim);
      t += 0.05;

      if (this.printerData.isPrinting) {
        extruder.position.x = Math.sin(t * 8) * 0.7;
        extruder.position.z = Math.cos(t * 6) * 0.4;
      }

      if (s.controls) s.controls.update();
      s.renderer.render(s.scene, s.camera);
    };
    anim();
  },

  // Басып шығару процесі (0 -> 100%)
  start3DPrinting() {
    if (!this.printerData || this.printerData.isPrinting) return;

    this.printerData.isPrinting = true;
    this.printerData.progress = 0;

    const btn = document.getElementById('btn-start-print');
    if (btn) {
      btn.disabled = true;
      btn.innerText = '⚙️ Басып шығарылуда...';
    }

    const progBar = document.getElementById('print-progress-bar');
    const progText = document.getElementById('print-progress-text');
    const layerText = document.getElementById('print-layer-text');

    if (window.sounds) window.sounds.startPrinterSound();

    const interval = setInterval(() => {
      this.printerData.progress += 1;
      const p = this.printerData.progress;

      if (progBar) progBar.style.width = p + '%';
      if (progText) progText.innerText = p + '%';
      if (layerText) layerText.innerText = Math.round(p * 1.2) + ' / 120 қабат';

      // Модельдің төменнен жоғары қарай өсуі
      const currentScaleY = Math.max(0.02, (p / 100) * 0.75);
      this.printerData.printItem.scale.y = currentScaleY;
      this.printerData.printItem.position.y = -0.87 + (currentScaleY * 0.6);

      // Экструдер рельсінің жоғары жылжуы
      const railY = -0.3 + (p / 100) * 1.6;
      this.printerData.xRail.position.y = railY;
      this.printerData.extruder.position.y = railY;

      if (p >= 100) {
        clearInterval(interval);
        this.printerData.isPrinting = false;

        if (window.sounds) {
          window.sounds.stopPrinterSound();
          window.sounds.playSuccessFanfare();
        }

        if (btn) {
          btn.disabled = false;
          btn.innerText = '✅ Басып шығару аяқталды!';
          btn.style.background = '#2e7d32';
        }

        if (typeof confetti === 'function') {
          confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
        }

        const alertBox = document.getElementById('print-done-alert');
        if (alertBox) alertBox.style.display = 'block';
      }
    }, 70);
  },

  // 2. Дайын көк «А» кілт брелогы сахнасы
  initKeychainScene() {
    const s = this.setupBasicScene('canvas-keychain', {
      camX: 1.8,
      camY: 1.6,
      camZ: 4.5,
      bgColor: 0xfffde7
    });
    if (!s) return;

    const keychainGroup = new THREE.Group();

    // 1) Түпнұсқа суреттегідей (media_1793634622389.png) мінсіз көк «А» әрпі
    const letterA = this.createLetterAGroup(0x0288d1);
    keychainGroup.add(letterA);

    // 2) Хромдалған металл сақинасы мен шынжыры
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.95,
      roughness: 0.1
    });

    // Төменгі біріктіруші сақина (А әрпінің ілмегіне тағылған)
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 16, 32), metalMat);
    ring1.position.set(0, 1.45, 0);
    keychainGroup.add(ring1);

    // Шынжырдың 2-буыны
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 16, 32), metalMat);
    ring2.rotation.y = Math.PI / 2;
    ring2.position.set(0, 1.85, 0);
    keychainGroup.add(ring2);

    // Үлкен негізгі кілт сақинасы (Flat key ring)
    const mainKeyRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.065, 16, 40), metalMat);
    mainKeyRing.position.set(0, 2.45, 0);
    keychainGroup.add(mainKeyRing);

    keychainGroup.position.y = -0.4;
    s.scene.add(keychainGroup);

    // Төменгі көрме дөңгелегі
    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.4, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: 0xffecb3, roughness: 0.4 })
    );
    podium.position.y = -1.6;
    s.scene.add(podium);

    let angle = 0;
    const anim = () => {
      requestAnimationFrame(anim);
      angle += 0.015;
      keychainGroup.rotation.y += 0.01;
      keychainGroup.rotation.z = Math.sin(angle) * 0.05;

      if (s.controls) s.controls.update();
      s.renderer.render(s.scene, s.camera);
    };
    anim();
  },

  /* ==========================================================================
     4-Бөлім: Өмірде қолданылуы (Сәулет, Медицина, Инженерия, Білім)
     ========================================================================== */
  initLifeScenes() {
    // 1. СӘУЛЕТ (3D үй)
    const archScene = this.setupBasicScene('canvas-arch', { camX: 3.5, camY: 3, camZ: 5, bgColor: 0xfffde7 });
    if (archScene) {
      const house = new THREE.Group();
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff9c4, roughness: 0.7 });
      const walls = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2.0), wallMat);
      walls.position.y = 0.8;
      house.add(walls);

      const roofMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.5 });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.0, 4), roofMat);
      roof.position.y = 2.1;
      roof.rotation.y = Math.PI / 4;
      house.add(roof);

      const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x5d4037 }));
      door.position.set(0, 0.45, 1.02);
      house.add(door);

      const winMat = new THREE.MeshStandardMaterial({ color: 0x81d4fa, roughness: 0.1 });
      const winL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.1), winMat);
      winL.position.set(-0.7, 0.9, 1.02);
      const winR = winL.clone(); winR.position.x = 0.7;
      house.add(winL, winR);

      const lawn = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0x81c784 }));
      lawn.position.y = -0.05;
      house.add(lawn);

      archScene.scene.add(house);
      const anim = () => {
        requestAnimationFrame(anim);
        house.rotation.y += 0.007;
        if (archScene.controls) archScene.controls.update();
        archScene.renderer.render(archScene.scene, archScene.camera);
      };
      anim();
    }

    // 2. МЕДИЦИНА (3D соғып тұрған жүрек)
    const medScene = this.setupBasicScene('canvas-med', { camZ: 3.8, bgColor: 0xfce4ec });
    if (medScene) {
      const heartGroup = new THREE.Group();
      const heartMat = new THREE.MeshStandardMaterial({ color: 0xc2185b, roughness: 0.3, metalness: 0.1 });
      const leftLobe = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 32), heartMat);
      leftLobe.position.set(-0.4, 0.3, 0);
      const rightLobe = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 32), heartMat);
      rightLobe.position.set(0.4, 0.3, 0);

      const bottomCone = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.4, 32), heartMat);
      bottomCone.position.set(0, -0.35, 0);
      bottomCone.rotation.z = Math.PI;

      const aortaMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.4 });
      const aorta = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.7, 16), aortaMat);
      aorta.position.set(0.2, 1.0, 0);
      aorta.rotation.z = 0.2;

      heartGroup.add(leftLobe, rightLobe, bottomCone, aorta);
      medScene.scene.add(heartGroup);

      let clock = new THREE.Clock();
      const anim = () => {
        requestAnimationFrame(anim);
        const t = clock.getElapsedTime();
        const beat = 1 + Math.sin(t * 7) * 0.06;
        heartGroup.scale.set(beat, beat, beat);
        heartGroup.rotation.y += 0.008;
        if (medScene.controls) medScene.controls.update();
        medScene.renderer.render(medScene.scene, medScene.camera);
      };
      anim();
    }

    // 3. ИНЖЕНЕРИЯ (3D Спорттық көлік)
    const engScene = this.setupBasicScene('canvas-eng', { camX: 3, camY: 2, camZ: 4.5, bgColor: 0xe0f7fa });
    if (engScene) {
      const carGroup = new THREE.Group();
      const carMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.2, metalness: 0.6 });
      const bodyBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 1.3), carMat);
      bodyBase.position.y = 0.35;
      carGroup.add(bodyBase);

      const glassMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.1, metalness: 0.8 });
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.1), glassMat);
      cabin.position.set(-0.2, 0.75, 0);
      carGroup.add(cabin);

      const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 24);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.8 });
      const wFL = new THREE.Mesh(wheelGeo, wheelMat);
      wFL.rotation.x = Math.PI / 2;
      wFL.position.set(0.85, 0.3, 0.65);
      const wFR = wFL.clone(); wFR.position.z = -0.65;
      const wRL = wFL.clone(); wRL.position.x = -0.85;
      const wRR = wFR.clone(); wRR.position.x = -0.85;
      carGroup.add(wFL, wFR, wRL, wRR);

      const grid = new THREE.GridHelper(5, 10, 0x00bcd4, 0xb2ebf2);
      grid.position.y = 0;
      carGroup.add(grid);

      engScene.scene.add(carGroup);
      const anim = () => {
        requestAnimationFrame(anim);
        carGroup.rotation.y += 0.009;
        if (engScene.controls) engScene.controls.update();
        engScene.renderer.render(engScene.scene, engScene.camera);
      };
      anim();
    }

    // 4. БІЛІМ (3D Сатурн ғаламшары)
    const eduScene = this.setupBasicScene('canvas-edu', { camZ: 4.8, bgColor: 0x0f172a });
    if (eduScene) {
      const spaceGroup = new THREE.Group();
      const planetMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.6 });
      const planet = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32), planetMat);
      spaceGroup.add(planet);

      const ringGeo = new THREE.RingGeometry(1.45, 2.3, 40);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.3;
      spaceGroup.add(ring);

      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: 0x81d4fa }));
      moon.position.set(2.6, 0.8, 0);
      spaceGroup.add(moon);

      eduScene.scene.add(spaceGroup);
      let angle = 0;
      const anim = () => {
        requestAnimationFrame(anim);
        planet.rotation.y += 0.006;
        ring.rotation.z += 0.002;
        angle += 0.02;
        moon.position.x = Math.cos(angle) * 2.8;
        moon.position.z = Math.sin(angle) * 2.8;
        if (eduScene.controls) eduScene.controls.update();
        eduScene.renderer.render(eduScene.scene, eduScene.camera);
      };
      anim();
    }
  }
};

window.ThreeScenes = ThreeScenes;
