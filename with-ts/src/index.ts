// add styles
import './styles/index.css';
import * as THREE from 'three';

import { sample, range } from "lodash";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import * as config from "./config";
import { camera, LightCamera } from "./cameras";


const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ alpha: true });
// renderer.physicallyCorrectLights = true;
renderer.setClearColor(new THREE.Color(0x441100));
// I think renderer will always clear() before a render.
renderer.autoClear = false;
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
document.body.appendChild(renderer.domElement); // the <canvas> element


const axis = new THREE.AxesHelper(200);
scene.add(axis);
axis.layers.disable(0);
axis.layers.enable(1);

const dancers = range(0, config.DOTS_AMOUNT).map(() => {
  return new THREE.Mesh(
    new THREE.SphereGeometry(20, 20, 30),
    new THREE.MeshBasicMaterial()
  );
});

const getRandomPositionInCubicWorldSpace = () => {
  return [
    THREE.MathUtils.randFloatSpread(dancerSpaceDimensions.x),
    THREE.MathUtils.randFloatSpread(dancerSpaceDimensions.y) + dancerSpaceDimensions.y / 2,
    THREE.MathUtils.randFloatSpread(dancerSpaceDimensions.z)
  ];
};

const dancerSpaceDimensions = { x: config.CUBIC_SIDE, y: config.CUBIC_SIDE, z: config.CUBIC_SIDE };
const dancerGroup = new THREE.Group();
dancers.forEach(b => {
  const [x, y, z] = getRandomPositionInCubicWorldSpace();
  b.position.set(x, y, z);
  dancerGroup.add(b);
});
scene.add(dancerGroup);

// For team Jupiter
// const gLoader = new GLTFLoader();

// gLoader.load("src/assets/mel.gltf", (duck) => {
//   duck.scene.scale.set(1, 1, 1);
//   scene.add(duck.scene);
// });

const getColorSample = (() => {
  const themeOne = [0xc02942, 0xa74321, 0x295164, 0x3e3943, 0xd8eabe, 0xffffff];
  // I need bubblegum hex codes.
  // I need MORE bubblegum hex codes.
  const bubbleGumTheme = [0xe042f5, 0xffc3c3, 0x92f5ff, 0xf9ff94, 0x87ffb0];
  // DIPPIN DOTS!
  const dippinDots = [0xffa23e, 0x75C2D8, 0xC4D483, 0xE0D8B9, 0xF49490, 0xE1F595, 0xFA7261];
  return () => sample(dippinDots);
})();

const testingLight = new THREE.PointLight(0xFFFFFF, 1);
scene.add(testingLight);

setInterval(() => {
  const [x, y, z] = getRandomPositionInCubicWorldSpace();
  testingLight.position.set(x, y, z);
}, 3000);

testingLight.power = 3000;
testingLight.decay = 0.7;
testingLight.distance = Infinity;

const cameraControls = new OrbitControls(camera, renderer.domElement);

let renderLightCameras = config.RENDER_LIGHT_CAM_VIEWPORTS;
let lightCameras = range(0, config.LIGHT_CAMERA_AMOUNT).map((_, i) => {
  return {
    cam: new LightCamera((i + 1) * 50, scene, true),
    relookAt: -Infinity,
  };
});


const clock = new THREE.Clock();

function render() {

  const d = clock.getDelta();
  const now = performance.now();

  const timer = 0.002 * now;
  dancers.forEach((box) => {
    if (Math.random() < .1) {
      box.material.color.setHex(getColorSample());
    }
    box.rotation.x += 0.05;
    box.translateX(Math.sin(timer) * 2);
    box.translateY(Math.sin(timer) * 0.3);
  });

  lightCameras.forEach(lightCamera => {
    lightCamera.cam.moveOnFrame(d);
    if (now < lightCamera.relookAt) return;
    lightCamera.cam.pointAt(sample(dancers).position);
    lightCamera.relookAt = now + THREE.MathUtils.randInt(5000, 10000);
  });

  cameraControls.update();

  renderer.clear()
  renderer.setViewport(0, 0, config.MAIN_VIEWPORT_WIDTH, config.MAIN_VIEWPORT_HEIGHT);
  renderer.render(scene, camera);

  if (renderLightCameras) {
    lightCameras.forEach(({ cam }, i) => {
      const h = lightCameras.length / 2; // Two rows hardcode.
      const [xPoint, yPoint, width, height] = cam.getViewportPositioning();
      renderer.setViewport(xPoint, yPoint, width, height);
      renderer.render(scene, cam.getRawCamera());
    });
  }

}

function animate() {
  requestAnimationFrame(animate);
  render();
}
animate();

globalThis.camera = camera;
