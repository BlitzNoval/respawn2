import * as THREE from 'three';

const gameData = [
  {
    id: 'aimtrainer',
    name: 'Aim Trainer',
    description: 'Practice your precision',
    year: '2024',
    panelId: 'panel-aimtrainer',
    imagePath: './Media/AimTrain2.png',
    color: 0x1a1a1a,
    reflectionColor: 0xff4444
  },
  {
    id: 'bombbrawl',
    name: 'Bomb Brawl',
    description: 'Explosive Isometric Couch PvP',
    year: '2025',
    panelId: 'panel-bombbrawl',
    imagePath: './Media/BombBrawl.png',
    color: 0x2a2a2a,
    reflectionColor: 0xffaa44
  },
  {
    id: 'paddle',
    name: 'Paddle',
    description: 'Single Player Paddle Simulation',
    year: '2025',
    panelId: 'panel-paddle',
    imagePath: './Media/PaddlePoster.png',
    color: 0x2a2a2a,
    reflectionColor: 0x44aaff
  },
  {
    id: 'respawn2',
    name: 'Respawn²',
    description: 'Online multiplayer isometric shooter',
    year: '2025',
    panelId: 'panel-respawn2',
    imagePath: './Media/RESPAWN3.jpg',
    color: 0x3a3a3a,
    reflectionColor: 0x44ff88
  }
];

class ThreeJsCardCatalog {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cards = [];
    this.infoPanel = null;
    this.navigationController = null;
    this.interactionManager = null;
    this.clock = new THREE.Clock();
    this.isRendering = true;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLighting();
    this.createGround();
    this.createCards();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
  }

  setupCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;

    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );

    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    document.body.appendChild(this.renderer.domElement);
  }

  setupLighting() {
  }

  createGround() {
  }

  createCards() {
    gameData.forEach((data, index) => {
      const card = new GameCard(data, index);
      this.cards.push(card);
      this.scene.add(card.getMesh());
      this.scene.add(card.getReflectionMesh());
      this.scene.add(card.getTextSprite());
    });

    this.cards[0].setActive(true);

    this.navigationController = new NavigationController(
      this.cards,
      this.camera
    );

    this.interactionManager = new InteractionManager(
      this.camera,
      this.scene,
      this.navigationController
    );

    this.updateHTMLPanel(gameData[0]);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;

    this.camera.left = (frustumSize * aspect) / -2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isRendering) return;

    const deltaTime = this.clock.getDelta();

    this.cards.forEach(card => card.update(deltaTime));

    this.renderer.render(this.scene, this.camera);
  }

  pauseRendering() {
    this.isRendering = false;
  }

  resumeRendering() {
    this.isRendering = true;
  }

  updateHTMLPanel(gameData) {
    const panel = document.querySelector('.game-info-panel');
    const title = document.getElementById('game-title');
    const description = document.getElementById('game-description');
    const btn = document.getElementById('view-project-btn');

    panel.classList.add('fade-out');

    setTimeout(() => {
      title.textContent = gameData.name;
      description.textContent = gameData.description;
      btn.setAttribute('data-game-id', gameData.id);

      panel.classList.remove('fade-out');
      panel.classList.add('fade-in');
    }, 150);
  }

}

class InfoPanel {
  constructor() {
    this.mesh = null;
    this.buttonMesh = null;
    this.lineMesh = null;
    this.canvas = null;
    this.ctx = null;
    this.currentGame = null;
    this.lineAnimationProgress = 0;
    this.isAnimatingLine = false;

    this.createPanel();
    this.createButton();
    this.createLine();
  }

  createPanel() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    this.canvas = canvas;
    this.ctx = ctx;

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geometry = new THREE.PlaneGeometry(4, 4);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.set(-5, -2.5, 0);
    this.mesh.rotation.x = -Math.PI / 3;
  }

  updateText(gameData) {
    this.currentGame = gameData;
    const ctx = this.ctx;
    const canvas = this.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(gameData.name, canvas.width / 2, 150);

    ctx.font = '36px Arial, sans-serif';
    ctx.fillStyle = '#333333';

    this.wrapText(ctx, gameData.description, canvas.width / 2, 280, 850, 50);

    this.mesh.material.map.needsUpdate = true;
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    words.forEach((word, index) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && index > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line.trim(), x, currentY);
  }

  createButton() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 128);

    ctx.fillStyle = '#000000';
    this.roundRect(ctx, 30, 30, 452, 68, 34);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('View Project', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geometry = new THREE.PlaneGeometry(2, 0.5);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.buttonMesh = new THREE.Mesh(geometry, material);
    this.buttonMesh.position.set(-5, -2.5, -1.8);
    this.buttonMesh.rotation.x = -Math.PI / 3;

    this.buttonMesh.userData.clickable = true;
    this.buttonMesh.userData.gameId = null;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  updateButton(gameId) {
    this.buttonMesh.userData.gameId = gameId;
  }

  createLine() {
    const points = [
      new THREE.Vector3(-1.6, 0, 0),
      new THREE.Vector3(-1.6, 0, 0)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 2
    });

    this.lineMesh = new THREE.Line(geometry, material);
  }

  updatePosition(zPosition) {
    this.mesh.position.z = zPosition;
    this.buttonMesh.position.z = zPosition;

    this.targetCardZ = zPosition;
    this.lineAnimationProgress = 0;
    this.isAnimatingLine = true;
  }

  updateLineAnimation(deltaTime) {
    if (!this.isAnimatingLine) return;

    this.lineAnimationProgress += deltaTime * 3;

    if (this.lineAnimationProgress >= 1) {
      this.lineAnimationProgress = 1;
      this.isAnimatingLine = false;
    }

    const t = this.lineAnimationProgress;
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const startX = -1.6;
    const startY = 0;
    const endX = -3;
    const endY = -2.5;

    const currentX = startX + (endX - startX) * eased;
    const currentY = startY + (endY - startY) * eased;

    const points = [
      new THREE.Vector3(startX, startY, this.targetCardZ),
      new THREE.Vector3(currentX, currentY, this.targetCardZ)
    ];

    this.lineMesh.geometry.setFromPoints(points);
  }

  getMeshes() {
    return [this.mesh, this.buttonMesh, this.lineMesh];
  }
}

class GameCard {
  constructor(data, index) {
    this.data = data;
    this.index = index;
    this.mesh = null;
    this.material = null;
    this.textSprite = null;

    this.targetRotation = -Math.PI / 16;
    this.currentRotation = -Math.PI / 16;

    this.baseY = 0;
    this.targetY = 0;
    this.currentY = 0;

    this.targetScale = 1.0;
    this.currentScale = 1.0;

    this.targetOpacity = 1.0;
    this.currentOpacity = 1.0;

    this.createCard();
  }

  extractColorFromImage(imagePath, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let r = 0, g = 0, b = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);

      const color = (r << 16) | (g << 8) | b;
      callback(color);
    };
    img.src = imagePath;
  }

  createCard() {
    const width = 3.2;
    const height = 4.2;

    const geometry = new THREE.PlaneGeometry(width, height, 32, 32);

    let material;
    if (this.data.imagePath) {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(this.data.imagePath);
      material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
      });

      this.extractColorFromImage(this.data.imagePath, (color) => {
        this.reflectionColor = color;
        if (this.reflectionMesh) {
          this.reflectionMesh.material.color.setHex(color);
        }
      });
    } else {
      material = new THREE.MeshBasicMaterial({
        color: this.data.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
      });
      this.reflectionColor = this.data.color;
    }

    this.material = material;
    this.mesh = new THREE.Mesh(geometry, material);

    const spacing = 4;
    const offset = -(gameData.length - 1) * spacing / 2;
    const xPos = offset + this.index * spacing;
    this.mesh.position.set(xPos, 0, 0);
    this.mesh.rotation.y = 0;

    this.mesh.userData = {
      gameId: this.data.id,
      originalY: this.mesh.position.y,
      clickable: true
    };

    this.createReflection(geometry, material, xPos, height);

    this.createYearLabel(xPos, height);
  }

  createYearLabel(xPos, height) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = 'rgba(255, 255, 255, 1.0)';
    context.font = 'bold 56px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.data.year, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1.0
    });

    this.textSprite = new THREE.Sprite(spriteMaterial);
    this.textSprite.scale.set(1.5, 0.75, 1);

    this.textSprite.position.set(xPos, -height / 2 - 0.5, 0);
    this.textSprite.userData.isYearLabel = true;
  }

  createReflection(geometry, material, xPos, height) {
    let reflectionMaterial;

    if (this.data.imagePath && material.map) {
      reflectionMaterial = new THREE.MeshBasicMaterial({
        map: material.map,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
    } else {
      reflectionMaterial = new THREE.MeshBasicMaterial({
        color: this.data.color,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
    }

    this.reflectionMesh = new THREE.Mesh(geometry, reflectionMaterial);
    this.reflectionMesh.userData.isReflection = true;

    const reflectionHeight = height * 0.4;
    this.reflectionMesh.position.set(xPos, -height / 2 - reflectionHeight / 2 - 0.1, 0);

    this.reflectionMesh.scale.set(1, -0.4, 1);

    this.reflectionMesh.rotation.x = Math.PI * 0.05;
  }

  setActive(isActive) {
    this.targetY = isActive ? 1.2 : 0;
    this.targetScale = isActive ? 1.12 : 1.0;
  }

  setBlurred(isBlurred) {
    this.targetOpacity = isBlurred ? 0.4 : 1.0;
  }

  update(deltaTime) {
    const speed = 4;

    const yDiff = this.targetY - this.currentY;
    if (Math.abs(yDiff) > 0.001) {
      this.currentY += yDiff * speed * deltaTime;
      this.mesh.position.y = this.baseY + this.currentY;

      if (this.textSprite) {
        this.textSprite.position.y = this.mesh.position.y - 2.1 - 0.5;
      }
    }

    const scaleDiff = this.targetScale - this.currentScale;
    if (Math.abs(scaleDiff) > 0.001) {
      this.currentScale += scaleDiff * speed * deltaTime;
      this.mesh.scale.setScalar(this.currentScale);
      if (this.reflectionMesh) {
        this.reflectionMesh.scale.set(this.currentScale, -0.4 * this.currentScale, this.currentScale);
      }
    }

    const opacityDiff = this.targetOpacity - this.currentOpacity;
    if (Math.abs(opacityDiff) > 0.001) {
      this.currentOpacity += opacityDiff * speed * deltaTime;
      this.material.opacity = this.currentOpacity;
      if (this.reflectionMesh) {
        this.reflectionMesh.material.opacity = this.currentOpacity * 0.25;
      }
      if (this.textSprite) {
        this.textSprite.material.opacity = this.currentOpacity * 0.9;
      }
    }
  }

  getMesh() {
    return this.mesh;
  }

  getReflectionMesh() {
    return this.reflectionMesh;
  }

  getTextSprite() {
    return this.textSprite;
  }
}

class NavigationController {
  constructor(cards, camera) {
    this.cards = cards;
    this.camera = camera;
    this.currentIndex = 0;
    this.isTransitioning = false;

    this.setupScrollListener();
    this.setupKeyboardListener();
  }

  setupScrollListener() {
    window.addEventListener('wheel', (event) => {
      event.preventDefault();

      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (Math.abs(delta) > 10) {
        const direction = delta > 0 ? 1 : -1;
        this.navigate(direction);
      }
    }, { passive: false });
  }

  setupKeyboardListener() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        this.navigate(-1);
      } else if (event.key === 'ArrowDown') {
        this.navigate(1);
      }
    });
  }

  navigate(direction) {
    const newIndex = this.currentIndex + direction;

    if (newIndex < 0 || newIndex >= this.cards.length) {
      return;
    }

    this.snapToCard(newIndex);
  }

  snapToCard(index) {

    this.cards[this.currentIndex].setActive(false);

    this.currentIndex = index;

    this.cards[this.currentIndex].setActive(true);

    this.cards.forEach((card, i) => {
      card.setBlurred(i !== index);
    });

    const gameData = this.cards[this.currentIndex].data;
    if (window.threeJsApp) {
      window.threeJsApp.updateHTMLPanel(gameData);
    }

    if (typeof updateArrowVisibility === 'function') {
      updateArrowVisibility();
    }

    this.animateCameraToCard(index);
  }

  animateCameraToCard(index) {
    const spacing = 4;
    const numCards = this.cards.length;
    const offset = -(numCards - 1) * spacing / 2;
    const targetX = offset + index * spacing;

    const startX = this.camera.position.x;
    const startTime = Date.now();
    const duration = 600;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.x = startX + (targetX - startX) * eased;
      this.camera.lookAt(targetX, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  getCurrentGame() {
    return this.cards[this.currentIndex].data;
  }
}

class InteractionManager {
  constructor(camera, scene, navigationController) {
    this.camera = camera;
    this.scene = scene;
    this.navigationController = navigationController;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('click', (event) => this.handleClick(event));
    window.addEventListener('mousemove', (event) => this.handleHover(event));
  }

  handleClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (object.userData.clickable && object.userData.gameId) {
        this.openPanel(object.userData.gameId);
      }
    }
  }

  handleHover(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    const isHoveringButton = intersects.length > 0 &&
                            intersects[0].object.userData.clickable;

    document.body.style.cursor = isHoveringButton ? 'pointer' : 'default';
  }

  openPanel(gameId) {
    window.openPanel(gameId);
  }
}

const app = new ThreeJsCardCatalog();

window.threeJsApp = app;
