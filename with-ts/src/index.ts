// add styles
import './style.css';
import * as THREE from 'three';

import { sample, range } from "lodash";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as config from "./config";
import { camera, LightCamera } from "./cameras";


const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
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

const dancerSpaceDimensions = { x: config.CUBIC_SIDE, y: config.CUBIC_SIDE, z: config.CUBIC_SIDE};
const dancerGroup = new THREE.Group();
dancers.forEach(b => {
  b.position.x = THREE.MathUtils.randFloatSpread(dancerSpaceDimensions.x);
  b.position.y = THREE.MathUtils.randFloatSpread(dancerSpaceDimensions.y) + dancerSpaceDimensions.y / 2;
  b.position.z = THREE.MathUtils.randFloatSpread(dancerSpaceDimensions.z);
  dancerGroup.add(b);
});
scene.add(dancerGroup);
const getColorSample = (() => {
  const themeOne = [0xc02942, 0xa74321, 0x295164, 0x3e3943, 0xd8eabe, 0xffffff];
  // I need bubblegum hex codes.
  // I need MORE bubblegum hex codes.
  const bubbleGumTheme = [0xe042f5, 0xffc3c3, 0x92f5ff, 0xf9ff94, 0x87ffb0];
  // DIPPIN DOTS!
  const dippinDots = [0xffa23e, 0x75C2D8, 0xC4D483, 0xE0D8B9, 0xF49490, 0xE1F595, 0xFA7261];
  return () => sample(dippinDots);
})();

const cameraControls = new OrbitControls(camera, renderer.domElement);

let renderLightCameras = config.RENDER_LIGHT_CAMS;
let lightCameras = range(0, 4).map((_, i) => {
  return {
    cam: new LightCamera((i + 1) * 50, scene, true),
    relookAt: -Infinity,
  };
});

const clock = new THREE.Clock();

function render() {

  // psuedocode

  // use a rotation matrix to set a destination quaternion for rotation (lookAt*)
  // on frame, move light cameras towards target quaternion by a step (rotateTowards*)
  // speed can be based with on frame clock delta
  // apply to all lightcameras (class?*)

  const d = clock.getDelta();
  const now = performance.now();

  const timer = 0.002 * now;
  dancers.forEach((box) => {
    if (Math.random() < .1) {
      box.material.color.setHex(getColorSample());
    }
    box.rotation.x += 0.05;
    box.translateX(Math.sin(timer) * 1);
    box.translateY(Math.sin(timer) * 0.3);
  });

  lightCameras.forEach(lightCamera => {
    lightCamera.cam.moveOnFrame(d);
    if (now < lightCamera.relookAt) return;
    lightCamera.cam.pointAt(sample(dancers).position);
    lightCamera.relookAt = now + THREE.MathUtils.randInt(5000, 10000);
  });

  cameraControls.update();

  renderer.clear();

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);

  if (renderLightCameras) {
    renderer.setViewport(0, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    renderer.render(scene, lightCameras[0].cam.getRawCamera());

    renderer.setViewport(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    renderer.render(scene, lightCameras[1].cam.getRawCamera());

    renderer.setViewport(0, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    renderer.render(scene, lightCameras[2].cam.getRawCamera());

    renderer.setViewport(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    renderer.render(scene, lightCameras[3].cam.getRawCamera());
  }

}

function animate() {
  requestAnimationFrame(animate);
  render();
}
animate();

globalThis.camera = camera;
