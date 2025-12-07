import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

import ceaText from './content/chinese_exclusion_act.txt?raw';
import cartoonText from './content/anti_chinese_cartoon.txt?raw';
import protestText from './content/student_protestors.txt?raw';
import chinText from './content/vincent_chin.txt?raw';
import maskText from './content/covid_mask.txt?raw';
import posterText from './content/anti_immigration_poster.txt?raw';
import openingText from './content/opening.txt?raw';

// --- Scene Setup ---
const scene = new THREE.Scene();
RectAreaLightUniformsLib.init();

// Removed solid background and fog to use room geometry instead
// scene.background = new THREE.Color(0x202020); 
// scene.fog = new THREE.Fog(0x202020, 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
document.getElementById('app')!.appendChild(renderer.domElement);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// --- Texture Generation ---
function createWallpaperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Background color (Reddish-Yellow / Amber)
  ctx.fillStyle = '#E6C288'; 
  ctx.fillRect(0, 0, 512, 512);
  
  // Pattern
  ctx.fillStyle = '#D4AF37'; // Gold-ish
  ctx.globalAlpha = 0.3;
  
  for(let i = 0; i < 10; i++) {
    for(let j = 0; j < 10; j++) {
      ctx.beginPath();
      ctx.arc(i * 50 + 25, j * 50 + 25, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Base wood color
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(0, 0, 512, 512);
  
  // Wood grain lines
  ctx.strokeStyle = '#5C4033';
  ctx.lineWidth = 2;
  
  for(let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 10 + Math.random() * 5);
    ctx.bezierCurveTo(
      100, i * 10 + Math.random() * 20, 
      400, i * 10 - Math.random() * 20, 
      512, i * 10 + Math.random() * 5
    );
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  return texture;
}

function createCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#800020'; // Burgundy
  ctx.fillRect(0, 0, 512, 512);
  
  // Border
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 20;
  ctx.strokeRect(10, 10, 492, 492);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// --- Room Environment ---
const roomWidth = 40;
const roomHeight = 20;
const roomDepth = 40;

// 1. Floor (Wood)
const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
const floorMaterial = new THREE.MeshStandardMaterial({ 
  map: createWoodTexture(),
  roughness: 0.5,
  metalness: 0.1
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 2. Carpet
const carpetGeometry = new THREE.PlaneGeometry(roomWidth * 0.8, roomDepth * 0.4); // Semi-circle area coverage rough approx
const carpetMaterial = new THREE.MeshStandardMaterial({ 
  map: createCarpetTexture(),
  roughness: 1.0 
});
const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
carpet.rotation.x = -Math.PI / 2;
carpet.position.y = 0.02; // Slightly above floor
carpet.position.z = -5; // Center under pedestals
carpet.receiveShadow = true;
scene.add(carpet);

// 3. Walls
const wallpaperTexture = createWallpaperTexture();
const wallMaterial = new THREE.MeshStandardMaterial({ 
  map: wallpaperTexture,
  side: THREE.DoubleSide 
});

// Back Wall (Behind artifacts)
const backWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
backWall.receiveShadow = true;
scene.add(backWall);

// Left Wall
const leftWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
const leftWall = new THREE.Mesh(leftWallGeo, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
leftWall.receiveShadow = true;
scene.add(leftWall);

// Right Wall
const rightWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
const rightWall = new THREE.Mesh(rightWallGeo, wallMaterial);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
rightWall.receiveShadow = true;
scene.add(rightWall);

// Front Wall (Behind camera - creates enclosed feeling)
const frontWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
const frontWall = new THREE.Mesh(frontWallGeo, wallMaterial);
frontWall.position.set(0, roomHeight / 2, roomDepth / 2);
frontWall.rotation.y = Math.PI; 
frontWall.receiveShadow = true;
scene.add(frontWall);

// Ceiling
const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = roomHeight;
scene.add(ceiling);

// --- Architectural Details ---
// Columns
function createColumn(x: number, z: number) {
  const colGeo = new THREE.CylinderGeometry(0.6, 0.8, roomHeight, 32);
  const colMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const col = new THREE.Mesh(colGeo, colMat);
  col.position.set(x, roomHeight / 2, z);
  col.castShadow = true;
  scene.add(col);
}

// Add columns in corners
createColumn(-roomWidth / 2 + 2, -roomDepth / 2 + 2);
createColumn(roomWidth / 2 - 2, -roomDepth / 2 + 2);
createColumn(-roomWidth / 2 + 2, roomDepth / 2 - 2);
createColumn(roomWidth / 2 - 2, roomDepth / 2 - 2);

// Window on Left Wall
const windowFrameGeo = new THREE.BoxGeometry(0.5, 6, 4);
const windowGlassGeo = new THREE.PlaneGeometry(0.1, 5.5, 3.5);
const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const glassMat = new THREE.MeshStandardMaterial({ 
  color: 0x88CCFF, 
  transparent: true, 
  opacity: 0.3,
  emissive: 0x112244
});

const winFrame = new THREE.Mesh(windowFrameGeo, frameMat);
winFrame.position.set(-roomWidth / 2 + 0.2, 8, 0); // Left wall, middle height
scene.add(winFrame);

const winGlass = new THREE.Mesh(windowGlassGeo, glassMat); // Rotate to match wall
winGlass.rotation.y = Math.PI / 2;
winGlass.position.set(-roomWidth / 2 + 0.5, 8, 0);
scene.add(winGlass);

// Add a light coming from the window
const windowLight = new THREE.RectAreaLight(0x88CCFF, 5, 4, 6);
windowLight.position.set(-roomWidth / 2 + 1, 8, 0);
windowLight.lookAt(0, 8, 0);
scene.add(windowLight);

// --- Lighting ---
// We need to ensure the room is lit, or it will look black/void-like if only spotlights exist
// Increase ambient light or add a point light in the center of the room
const centerLight = new THREE.PointLight(0xffffff, 50, 50);
centerLight.position.set(0, 15, 0);
scene.add(centerLight);

// --- Museum Elements ---
const pedestals: THREE.Mesh[] = [];
const clickTargets: THREE.Object3D[] = [];

function createChineseExclusionActArtifact() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 350;
  const ctx = canvas.getContext('2d')!;

  // Paper background
  ctx.fillStyle = '#fdfbf7'; 
  ctx.fillRect(0, 0, 256, 350);

  // Title Text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Chinese Exclusion', 128, 40);
  ctx.fillText('Act', 128, 70);

  // Squiggly lines
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  
  for(let i = 0; i < 10; i++) {
    const y = 110 + i * 20;
    ctx.beginPath();
    ctx.moveTo(40, y);
    for(let x = 40; x < 216; x+= 5) {
        ctx.lineTo(x, y + Math.sin(x * 0.5) * 1.5); 
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  
  // Create wavy geometry
  const geometry = new THREE.PlaneGeometry(0.8, 1.1, 20, 20);
  const posAttribute = geometry.attributes.position;
  
  for (let i = 0; i < posAttribute.count; i++) {
    const y = posAttribute.getY(i);
    // Sine wave distortion based on Y position (waves go up and down)
    const z = Math.sin(y * 10) * 0.05; 
    posAttribute.setZ(i, z);
  }
  
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ 
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true // In case we want alpha later, but solid for now
  });
  
  const paper = new THREE.Mesh(geometry, material);
  paper.userData = { 
    isFloatingPaper: true,
    title: 'Chinese Exclusion Act',
    description: ceaText,
    imageColor: '#fdfbf7' // Placeholder color for popup image
  }; 
  return paper;
}

function createOrientalInvasionArtifact() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 360; // Shorter, folded height
  const ctx = canvas.getContext('2d')!;

  // Newspaper background (Aged Newsprint)
  ctx.fillStyle = '#eae6da'; 
  ctx.fillRect(0, 0, 512, 360);

  // Masthead (Newspaper Name)
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 40px serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE SUNDAY NEWS', 256, 50);
  
  // Date Line / Separator
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 60);
  ctx.lineTo(492, 60);
  ctx.stroke();
  
  ctx.font = 'italic 16px serif';
  ctx.fillText('September 23, 1886', 256, 80);
  
  ctx.beginPath();
  ctx.moveTo(20, 90);
  ctx.lineTo(492, 90);
  ctx.stroke();

  // Headline
  ctx.font = 'bold 52px impact, sans-serif'; // Bigger headline
  ctx.fillText('ORIENTAL INVASION', 256, 150);

  // Comic Strip (Visual focus)
  const comicY = 180;
  const comicH = 150;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(56, comicY, 400, comicH);
  ctx.strokeRect(56, comicY, 400, comicH);
  
  // Simple "Political Cartoon" style drawing inside
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Abstract crowd
  for(let i=0; i<5; i++) {
    ctx.arc(100 + i*60, comicY + 80, 20, 0, Math.PI*2); // Heads
    ctx.moveTo(100 + i*60, comicY + 100);
    ctx.lineTo(100 + i*60, comicY + 140); // Bodies
  }
  ctx.stroke();
  ctx.font = 'bold 20px serif';
  ctx.fillStyle = '#000000';
  ctx.fillText('"The Coming Danger!"', 256, comicY + 30);

  const texture = new THREE.CanvasTexture(canvas);
  
  // Create Geometry - Thick Box (Folded Newspaper)
  // Width: 1.0, Height: 0.7 (folded), Depth: 0.05
  const geometry = new THREE.BoxGeometry(1.0, 0.7, 0.05);

  // Edge texture (lines to look like pages)
  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = 64; 
  edgeCanvas.height = 64;
  const edgeCtx = edgeCanvas.getContext('2d')!;
  edgeCtx.fillStyle = '#eae6da'; 
  edgeCtx.fillRect(0,0,64,64);
  edgeCtx.strokeStyle = '#d0cdc0'; 
  edgeCtx.lineWidth = 1;
  for(let i=0; i<64; i+=4) {
      edgeCtx.beginPath(); 
      edgeCtx.moveTo(0, i); 
      edgeCtx.lineTo(64, i); 
      edgeCtx.stroke();
  }
  const edgeTexture = new THREE.CanvasTexture(edgeCanvas);

  const mainMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 });
  const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTexture, roughness: 0.9 });
  const plainMat = new THREE.MeshStandardMaterial({ color: 0xeae6da, roughness: 0.9 });

  // Materials array: [Right, Left, Top, Bottom, Front, Back]
  // Front gets the newspaper texture.
  const materials = [
      edgeMat, // Right
      edgeMat, // Left
      edgeMat, // Top
      plainMat, // Bottom (Fold)
      mainMat, // Front
      plainMat  // Back
  ];
  
  const paper = new THREE.Mesh(geometry, materials);
  paper.userData = { 
    isFloatingPaper: true,
    title: 'Anti-Chinese Political Cartoon',
    description: cartoonText,
    imageColor: '#eae6da'
  }; 
  return paper;
}

function createStudentProtestArtifact() {
  const group = new THREE.Group();

  // Create 3 simple low-poly human figures (abstract statues) holding signs
  
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
  const signStickMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
  const signPaperMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

  function createProtester(x: number, z: number, rotation: number) {
      const protester = new THREE.Group();
      protester.position.set(x, 0, z);
      protester.rotation.y = rotation;

      // Body (Cone/Cylinder)
      const bodyGeo = new THREE.CylinderGeometry(0.15, 0.25, 0.8, 16);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.4;
      protester.add(body);

      // Head (Sphere)
      const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.95;
      protester.add(head);

      // Arms (Simple Box)
      const armGeo = new THREE.BoxGeometry(0.6, 0.1, 0.1);
      const arms = new THREE.Mesh(armGeo, bodyMat);
      arms.position.y = 0.65;
      protester.add(arms);

      // Sign Stick
      const stickGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.0);
      const stick = new THREE.Mesh(stickGeo, signStickMat);
      stick.position.set(0.2, 0.8, 0.2); // Hold in right hand
      stick.rotation.x = -0.2;
      protester.add(stick);

      // Sign Board
      const signGeo = new THREE.BoxGeometry(0.4, 0.3, 0.02);
      const sign = new THREE.Mesh(signGeo, signPaperMat);
      sign.position.set(0.2, 1.25, 0.25);
      sign.rotation.x = -0.2;
      protester.add(sign);

      return protester;
  }

  // Add 3 protesters to the group
  group.add(createProtester(0, 0, 0));
  group.add(createProtester(-0.3, -0.2, -0.3));
  group.add(createProtester(0.3, -0.2, 0.3));

  // The group needs to be centered vertically somewhat? 
  // No, the function caller expects the object origin to be bottom-center(ish).
  
  // We'll wrap this group in another mesh or just return it. 
  // The system expects a Mesh for raycasting usually, but we can return Group. 
  // However, raycasting works best on Mesh. 
  // Let's create an invisible box that bounds them for clicking, or just add meshes to group.
  
  // Note: The rotation logic in animate() modifies .rotation.y
  // If we return a Group, it has rotation properties too.
  
  // Flag for animation loop (keep upright)
  group.userData = { 
    isFloatingPaper: true,
    title: 'Student Protestors',
    description: protestText,
    imageColor: '#888888'
  }; 
  
  return group as unknown as THREE.Mesh; // Casting to Mesh to satisfy TS signature, though it's a Group (Object3D)
}

function createVincentChinArtifact() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 600;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#f4e4bc'; // Aged paper
  ctx.fillRect(0, 0, 512, 600);

  // Headline
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 40px serif';
  ctx.textAlign = 'center';
  ctx.fillText('JUSTICE FOR', 256, 60);
  ctx.fillText('VINCENT CHIN', 256, 110);

  // Date
  ctx.font = 'italic 24px serif';
  ctx.fillText('June 23, 1982', 256, 150);

  // Image placeholder (Silhouette)
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(256, 250, 60, 0, Math.PI * 2); // Head
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(196, 320);
  ctx.quadraticCurveTo(256, 280, 316, 320);
  ctx.lineTo(316, 450);
  ctx.lineTo(196, 450);
  ctx.fill();

  // Subtext
  ctx.font = '20px serif';
  ctx.fillText('A Community Unites', 256, 500);
  ctx.fillText('Against Hate', 256, 530);

  const texture = new THREE.CanvasTexture(canvas);
  
  // Torn paper look
  const geometry = new THREE.PlaneGeometry(0.9, 1.1, 15, 15);
  const pos = geometry.attributes.position;
  for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Curl corners
      if (Math.abs(x) > 0.3 && Math.abs(y) > 0.4) {
          pos.setZ(i, Math.sin(x*y)*0.1);
      }
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ 
      map: texture, 
      side: THREE.DoubleSide,
      roughness: 0.8,
      transparent: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { 
    isFloatingPaper: true,
    title: 'Who Killed Vincent Chin News Article',
    description: chinText,
    imageColor: '#f4e4bc'
  };
  return mesh;
}

function createCovidMaskArtifact() {
    const group = new THREE.Group();

    // Mask Body (Blue pleated fabric)
    const maskGeo = new THREE.PlaneGeometry(1.0, 0.6, 10, 10);
    // Curve the mask
    const pos = maskGeo.attributes.position;
    for(let i=0; i<pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, -Math.pow(x, 2) * 0.5); // Parabolic curve to fit face
    }
    maskGeo.computeVertexNormals();

    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#4aa3df'; // Surgical blue
    ctx.fillRect(0,0,256,256);
    // Pleats
    ctx.fillStyle = '#3a83bf';
    ctx.fillRect(0, 50, 256, 20);
    ctx.fillRect(0, 120, 256, 20);
    ctx.fillRect(0, 190, 256, 20);
    
    const texture = new THREE.CanvasTexture(canvas);
    const maskMat = new THREE.MeshStandardMaterial({ 
        map: texture, 
        side: THREE.DoubleSide, 
        roughness: 0.9 
    });
    
    const mask = new THREE.Mesh(maskGeo, maskMat);
    group.add(mask);

    // Straps (White loops)
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    // Left Loop
    const loopCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.5, 0.2, -0.1),
        new THREE.Vector3(-0.7, 0.1, -0.3),
        new THREE.Vector3(-0.7, -0.1, -0.3),
        new THREE.Vector3(-0.5, -0.2, -0.1)
    ]);
    const loopGeo = new THREE.TubeGeometry(loopCurve, 20, 0.02, 8, false);
    const leftLoop = new THREE.Mesh(loopGeo, strapMat);
    group.add(leftLoop);

    // Right Loop
    const loopCurveR = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.5, 0.2, -0.1),
        new THREE.Vector3(0.7, 0.1, -0.3),
        new THREE.Vector3(0.7, -0.1, -0.3),
        new THREE.Vector3(0.5, -0.2, -0.1)
    ]);
    const loopGeoR = new THREE.TubeGeometry(loopCurveR, 20, 0.02, 8, false);
    const rightLoop = new THREE.Mesh(loopGeoR, strapMat);
    group.add(rightLoop);

    group.userData = { 
        isFloatingPaper: true,
        title: 'Covid Mask',
        description: maskText,
        imageColor: '#4aa3df'
    };
    return group as unknown as THREE.Mesh;
}

function createAntiImmigrationPosterArtifact() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  // Background (Stark, Warning style)
  ctx.fillStyle = '#cc0000'; 
  ctx.fillRect(0, 0, 512, 700);
  ctx.fillStyle = '#ffff00'; // Yellow burst
  ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(512,0); ctx.lineTo(256, 300); ctx.fill();

  // Text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 50px impact';
  ctx.textAlign = 'center';
  ctx.fillText('STOP', 256, 400);
  ctx.fillText('IMMIGRATION', 256, 460);

  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PROTECT OUR BORDERS', 256, 550);

  // Symbol (Hand or Stop sign)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.strokeRect(50, 350, 412, 300);

  const texture = new THREE.CanvasTexture(canvas);
  
  // Rigid Poster Board
  const geometry = new THREE.BoxGeometry(1.0, 1.4, 0.05);
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });

  const poster = new THREE.Mesh(geometry, [
      edgeMat, edgeMat, edgeMat, edgeMat, material, edgeMat
  ]);
  
  poster.userData = { 
      isFloatingPaper: true,
      title: 'Anti-Immigration Poster',
      description: posterText,
      imageColor: '#cc0000'
  };
  return poster;
}

// Helper to create a pedestal
function createPedestal(x: number, z: number, customArtifact?: THREE.Object3D) {
  // Pedestal Base
  const pedWidth = 1.5;
  const pedHeight = 2.5; // Slightly taller
  const geometry = new THREE.BoxGeometry(pedWidth, pedHeight, pedWidth);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const pedestal = new THREE.Mesh(geometry, material);
  pedestal.position.set(x, pedHeight / 2, z);
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  pedestals.push(pedestal);

  let art: THREE.Object3D;

  if (customArtifact) {
    art = customArtifact;
    // Position floating slightly above
    art.position.set(x, pedHeight + 0.8, z);
  } else {
  // The "Square" (Artifact) on top
  const artSize = 0.8;
  const artGeo = new THREE.BoxGeometry(artSize, artSize, artSize);
  const artMat = new THREE.MeshStandardMaterial({ color: 0xee5555 }); // Reddish square
    art = new THREE.Mesh(artGeo, artMat);
    art.position.set(x, pedHeight + artSize / 2, z);
  }

  // Handle casting shadow for group or mesh
  art.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  });

  scene.add(art);
  
  // Add this 'art' object to our list of clickable things
  clickTargets.push(art);

  // Spotlight for this pedestal
  const spotLight = new THREE.SpotLight(0xffffff, 50);
  spotLight.position.set(x, 10, z);
  spotLight.target = art;
  spotLight.angle = Math.PI / 8;
  spotLight.penumbra = 0.3;
  spotLight.castShadow = true;
  scene.add(spotLight);
}

// Create 5-7 Pedestals in a semi-circle or random arrangement
// Let's do a semi-circle
const radius = 8;
const count = 6; 
for (let i = 0; i < count; i++) {
  const angle = (i / (count - 1)) * Math.PI; // Spread across 180 degrees (0 to PI)
  // In Three.js, 0 is typically +X, PI/2 is -Z (forward).
  // We want the semi-circle to be in front of the camera (which is at 0,0,10 looking at 0,0,0)
  // Let's spread from left to right.
  
  const x = Math.cos(angle + Math.PI) * radius; // Flip to be behind/around
  const z = Math.sin(angle + Math.PI) * radius;
  
  if (i === 0) {
     const paperArtifact = createOrientalInvasionArtifact();
     createPedestal(x, z, paperArtifact);
  } else if (i === 1) {
     const paperArtifact = createChineseExclusionActArtifact();
     createPedestal(x, z, paperArtifact);
  } else if (i === 2) {
     const protestArtifact = createStudentProtestArtifact();
     createPedestal(x, z, protestArtifact);
  } else if (i === 3) {
     const vincentArtifact = createVincentChinArtifact();
     createPedestal(x, z, vincentArtifact);
  } else if (i === 4) {
     const maskArtifact = createCovidMaskArtifact();
     createPedestal(x, z, maskArtifact);
  } else if (i === 5) {
     const posterArtifact = createAntiImmigrationPosterArtifact();
     createPedestal(x, z, posterArtifact);
  } else {
     createPedestal(x, z);
  }
}

// --- Interaction ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Start Screen Logic
const startScreen = document.getElementById('start-screen');
const enterBtn = document.getElementById('enter-btn');
const startTextEl = document.getElementById('start-text');

if (startTextEl) {
    startTextEl.innerText = openingText;
}

enterBtn?.addEventListener('click', () => {
    startScreen?.classList.add('hidden');
    // Optional: Start background music or camera fly-in here
});

// Popup Logic
const popup = document.getElementById('popup');
const closeBtn = document.getElementById('close-btn');
const popupContainer = document.getElementById('popup-3d-container');

// Popup 3D Scene Setup
const popupScene = new THREE.Scene();
popupScene.background = new THREE.Color(0xf0f0f0); // Match container bg

const popupCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
popupCamera.position.set(0, 0, 3); // Closer view
popupCamera.lookAt(0, 0, 0);

const popupRenderer = new THREE.WebGLRenderer({ antialias: true });
// Size will be set when opening or resizing
if(popupContainer) {
    popupRenderer.setSize(popupContainer.clientWidth, popupContainer.clientHeight);
    popupContainer.appendChild(popupRenderer.domElement);
}

// Lighting for Popup
const popupAmbient = new THREE.AmbientLight(0xffffff, 0.6);
popupScene.add(popupAmbient);
const popupDirLight = new THREE.DirectionalLight(0xffffff, 0.8);
popupDirLight.position.set(2, 2, 5);
popupScene.add(popupDirLight);

let popupArtifact: THREE.Object3D | null = null;

closeBtn?.addEventListener('click', () => {
  popup?.classList.add('hidden');
  // Clean up popup scene object
  if (popupArtifact) {
      popupScene.remove(popupArtifact);
      popupArtifact = null;
  }
});

function onPointerClick(event: MouseEvent) {
  // Calculate pointer position in normalized device coordinates (-1 to +1)
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster
  raycaster.setFromCamera(pointer, camera);

  // Check intersections
  const intersects = raycaster.intersectObjects(clickTargets, true); // recursive true for groups

  if (intersects.length > 0) {
    // Clicked on an artifact
    // Find the root object that has our userData (could be parent of clicked mesh)
    let target = intersects[0].object;
    while(target.parent && !target.userData.title) {
        target = target.parent;
    }

    if (target.userData.title && popup) {
        // Populate Popup Text
        const titleEl = document.getElementById('popup-title');
        const descEl = document.getElementById('popup-desc');
        
        if(titleEl) titleEl.innerText = target.userData.title;
        if(descEl) descEl.innerText = target.userData.description;
        
        // Setup 3D View
        if (popupArtifact) {
            popupScene.remove(popupArtifact);
        }
        
        // Clone the artifact
        popupArtifact = target.clone();
        
        // Reset position to center of popup scene
        popupArtifact.position.set(0, 0, 0);
        
        // Adjust rotation if needed (show front face)
        popupArtifact.rotation.set(0, 0, 0);
        
        // Special case adjustment for some artifacts if they look better tilted
        // The newspaper/papers usually look good upright or slightly tilted back
        // But let's just keep them spinning upright for now
        
        popupScene.add(popupArtifact);

        popup.classList.remove('hidden');

        // Update renderer size in case window resized
        if(popupContainer) {
            const width = popupContainer.clientWidth;
            const height = popupContainer.clientHeight;
            popupRenderer.setSize(width, height);
            popupCamera.aspect = width / height;
            popupCamera.updateProjectionMatrix();
        }
    }
  }
}

window.addEventListener('click', onPointerClick);

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  
  // 1. Main Scene Animation
  // Optional: Slowly rotate artifacts
  clickTargets.forEach(art => {
    art.rotation.y += 0.01;
    
    // Check if it's our special paper artifact
    if (art.userData.isFloatingPaper) {
      // Keep it upright (no X rotation), just spin (Y rotation is already handled above)
      art.rotation.x = 0; 
      art.rotation.z = 0;
    } else {
      // Normal rotation for other artifacts (cubes)
    art.rotation.x += 0.005;
    }
  });

  renderer.render(scene, camera);
  
  // 2. Popup Scene Animation
  if (!popup?.classList.contains('hidden') && popupArtifact) {
      // popupArtifact.rotation.y += 0.01; // Removed spinning
      popupRenderer.render(popupScene, popupCamera);
  }
}

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
