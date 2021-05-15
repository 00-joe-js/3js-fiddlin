import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// "ft", "bk", "up", "dn", "rt", "lf"
export const createSkyboxTextureMaterials = () => {
    const assetUrlPrefix = "/src/assets/skybox";
    const sides = ["right", "left", "top", "bottom", "front", "back"];
    return sides
        .map(side => textureLoader.load(`${assetUrlPrefix}/${side}.png`))
        .map(texture => new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));
};

const sideSize = 10000000;
const cubeGeom = new THREE.BoxGeometry(sideSize, sideSize, sideSize);

const testColorMaterials = () => {
    // [front, top, back, bottom, ]
    const colors = [0xff0000, 0x00ff00, 0x0000ff, "purple", "orange", "yellow"];
    return colors.map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.BackSide }));
};

const skybox = new THREE.Mesh(cubeGeom, createSkyboxTextureMaterials());

export default skybox;