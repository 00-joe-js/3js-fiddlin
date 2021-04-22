import * as THREE from 'three';

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.layers.enable(1); // Assign also to layer 1 so it can see the camera helpers.

export class LightCamera {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    helper: THREE.CameraHelper;
    speed: number = 0.5;
    private rotationMatrix: THREE.Matrix4;
    private targetQuaternion: THREE.Quaternion;

    static FOV = 5;
    static FAR = 12000;

    constructor(z: number, scene: THREE.Scene, addHelperToSceneImmediately = true) {
        this.scene = scene;
        
        this.camera = new THREE.PerspectiveCamera(LightCamera.FOV, 1, 0.1, LightCamera.FAR);
        this.camera.position.set(7, 5, z);

        this.helper = new THREE.CameraHelper(this.camera);
        this.helper.layers.disable(0);
        this.helper.layers.set(1);
        this.helper.matrixAutoUpdate = true;

        if (addHelperToSceneImmediately) this.addHelperToScene();

        this.rotationMatrix = new THREE.Matrix4();
        this.targetQuaternion = new THREE.Quaternion;
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
