import * as THREE from 'three';

import * as config from "../config";
const ASPECT = config.MAIN_VIEWPORT_WIDTH / config.MAIN_VIEWPORT_HEIGHT;

export const camera = new THREE.PerspectiveCamera(75, ASPECT, 0.1, 100000);
camera.layers.enable(1); // Assign also to layer 1 so it can see the camera helpers.

export class LightCamera {

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    helper: THREE.CameraHelper;
    speed: number = 0.5;

    private rotationMatrix: THREE.Matrix4;
    private targetQuaternion: THREE.Quaternion;
    private subSpaceElement: HTMLDivElement;

    static FOV = config.LIGHT_CAM_FOV;
    static FAR = config.LIGHT_CAM_FAR;

    static FIXED_DOM_ID = "my-friend-named-dom";

    constructor(z: number, scene: THREE.Scene, addHelperToSceneImmediately = true) {
        this.scene = scene;

        this.camera = new THREE.PerspectiveCamera(LightCamera.FOV, ASPECT, 0.1, LightCamera.FAR);
        this.camera.position.set(7, 5, z);

        this.helper = new THREE.CameraHelper(this.camera);
        this.helper.layers.disable(0);
        this.helper.layers.set(1);
        this.helper.matrixAutoUpdate = true;

        if (addHelperToSceneImmediately) this.addHelperToScene();

        this.rotationMatrix = new THREE.Matrix4();
        this.targetQuaternion = new THREE.Quaternion;

        if (config.RENDER_LIGHT_CAM_VIEWPORTS) {
            this.createSubSpaceDOMElement();
        }
    }
    createSubSpaceDOMElement() {
        const w = config.LC_VIEWPORT_DIMENSIONS_W;
        const h = config.LC_VIEWPORT_DIMENSIONS_H;
        const e = document.createElement("div")
        this.subSpaceElement = e;
        e.classList.add("sub-space");
        document.querySelector(`#${LightCamera.FIXED_DOM_ID}`).appendChild(e);
        const topx = n => `${n}px`;
        e.style.width = topx(w);
        e.style.height = topx(h);
        e.style.top = topx(THREE.MathUtils.randInt(0, window.innerHeight - h));
        e.style.left = topx(THREE.MathUtils.randInt(0, window.innerWidth - w));
    }
    getViewportPositioning() {
        const e = this.subSpaceElement;
        return [
            e.offsetLeft,
            window.innerHeight - config.LC_VIEWPORT_DIMENSIONS_H - e.offsetTop,
            config.LC_VIEWPORT_DIMENSIONS_W,
            config.LC_VIEWPORT_DIMENSIONS_H
        ];
    }
    getRawCamera() {
        return this.camera;
    }
    addHelperToScene() {
        this.scene.add(this.helper);
    }
    pointAt(position: THREE.Vector3) {
        // Twist the matrix from camera to object
        this.rotationMatrix.lookAt(
            this.camera.position,
            position,
            this.camera.up
        );
        this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);
    }
    moveOnFrame(timeDelta: number) {
        if (this.camera.quaternion.equals(this.targetQuaternion)) return;
        this.camera.quaternion.rotateTowards(this.targetQuaternion, timeDelta * this.speed);
        this.camera.updateProjectionMatrix();
        this.helper.quaternion.rotateTowards(this.targetQuaternion, timeDelta * this.speed);
    }
}

const co = {
    "x": 5000,
    "y": 2000,
    "z": 1500
};

camera.position.set(
    co.x,
    co.y,
    co.z
);

export default camera;