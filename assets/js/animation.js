import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";

let container, stats;
let camera, scene, renderer;
let mesh, texture;

const worldWidth = 256,
  worldDepth = 256;
const clock = new THREE.Clock();

const cameraHeight = 1000; // Maintain this height
let curve;
const pathDuration = 30; // seconds for a complete loop

init();
animate();

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xefd1b5);
  scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);

  const data = generateHeight(worldWidth, worldDepth);

  generateSmoothPath();

  const geometry = new THREE.PlaneGeometry(
    7500,
    7500,
    worldWidth - 1,
    worldDepth - 1
  );
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array;

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * 10;
  }

  texture = new THREE.CanvasTexture(
    generateTexture(data, worldWidth, worldDepth)
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: texture })
  );
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  // container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);
}

function generateSmoothPath() {
  const points = [];
  const segments = 5; // Fewer control points for a smoother path
  let x = 400,
    z = -1000;

  for (let i = 0; i <= segments; i++) {
    x += (Math.random() - 0.9) * 400; // Larger, smoother movements
    z += (Math.random() - 0.9) * 400;
    points.push(new THREE.Vector3(x, cameraHeight, z));
  }

  // Ensure the path loops smoothly
  points.push(points[0].clone());

  // Use THREE.CatmullRomCurve3 instead of CatmullRomCurve3
  curve = new THREE.CatmullRomCurve3(points, true); // Create a closed loop
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function generateHeight(width, height) {
  let seed = Math.PI / 4;
  window.Math.random = function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const size = width * height,
    data = new Uint8Array(size);
  const perlin = new ImprovedNoise(),
    z = Math.random() * 100;

  let quality = 1;

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width,
        y = ~~(i / width);
      data[i] += Math.abs(
        perlin.noise(x / quality, y / quality, z) * quality * 1.75
      );
    }
    quality *= 5;
  }

  return data;
}

function generateTexture(data, width, height) {
  let context, image, imageData, shade;

  const vector3 = new THREE.Vector3(0, 0, 0);
  const sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    shade = vector3.dot(sun);

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
    imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);

  // Scaled 4x
  const canvasScaled = document.createElement("canvas");
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext("2d");
  context.scale(4, 4);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  for (let i = 0, l = imageData.length; i < l; i += 4) {
    const v = ~~(Math.random() * 5);
    imageData[i] += v;
    imageData[i + 1] += v;
    imageData[i + 2] += v;
  }

  context.putImageData(image, 0, 0);

  return canvasScaled;
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  const time = (clock.getElapsedTime() % pathDuration) / pathDuration;

  // Get current position and next position on the curve
  const position = new THREE.Vector3();
  curve.getPointAt(time, position);

  const lookAtPosition = new THREE.Vector3();
  curve.getPointAt((time + 0.01) % 1, lookAtPosition);

  // Update camera position and orientation
  camera.position.copy(position);
  camera.lookAt(lookAtPosition);

  renderer.render(scene, camera);
}
