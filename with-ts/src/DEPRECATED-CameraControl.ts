/*

this entire file is replaced by OrbitControls
but a helpful process

*/

export default class CameraControl {

    static MOUSE_SENS: number = 0.001;

    camera: THREE.PerspectiveCamera;
    dom: HTMLElement;
    constructor(camera, eventfulDOMElement: HTMLElement) {
        this.camera = camera;
        this.dom = eventfulDOMElement;
    }

    moveWithLeft = (mouseMoveE) => {
        this.camera.translateX(mouseMoveE.movementX * .1);
        this.camera.translateY(mouseMoveE.movementY * .1);
    };

    tiltAndPanOffMouseMove = (mouseMoveE) => {
        this.camera.rotateY(mouseMoveE.movementX * CameraControl.MOUSE_SENS); // mouse sens
        this.camera.rotateX(mouseMoveE.movementY * CameraControl.MOUSE_SENS);
        this.camera.rotation.z = 0;
    };

    registerMouseListeners() {

        const on = this.dom.addEventListener.bind(this.dom);
        const off = this.dom.removeEventListener.bind(this.dom);
        const camera = this.camera;

        // clear refactor soon
        const removeLeftListeners = () => {
            off("mousemove", this.moveWithLeft);
            off("mouseup", removeLeftListeners);
        };
        const removeRightListeners = () => {
            off("mousemove", this.tiltAndPanOffMouseMove);
            off("mouseup", removeRightListeners);
        };

        on("mousedown", (e) => {
            if (e.button === 0) { // left click
                on("mousemove", this.moveWithLeft);
                on("mouseup", removeLeftListeners);
            }
            if (e.button === 2) { // right click
                on("mousemove", this.tiltAndPanOffMouseMove);
                on("mouseup", removeRightListeners)
            }
        });

        on("contextmenu", (e) => {
            e.preventDefault();
        });

        on("wheel", (e) => {
            camera.translateZ(e.deltaY / 50);
        });

    }

}