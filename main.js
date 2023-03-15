import * as Three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import AvatarSample from './assets/AvatarSample_A.vrm';

const renderer = new Three.WebGLRenderer();
renderer.outputEncoding = Three.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const camera = new Three.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 2000 );
camera.position.set(0, 1.6, 3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0, 1.6, 0);
controls.update();

const scene = new Three.Scene();

const light = new Three.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

const loader = new GLTFLoader();
loader.crossOrigin = 'anonymous';
loader.register(parser => new VRMLoaderPlugin(parser));
loader.load(AvatarSample, gltf => {
    const vrm = gltf.userData.vrm;
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.removeUnnecessaryJoints(gltf.scene);
    vrm.scene.traverse((obj) => {
      obj.frustumCulled = false;
    })
    scene.add(vrm.scene);
    console.log(vrm);
  },
  (progress) => {
    console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%');
  },
  (error) => {
    console.log('An error happened', error);
});

const gridHelper = new Three.GridHelper(10, 10);
scene.add(gridHelper);

const axesHelper = new Three.AxesHelper(5);
scene.add(axesHelper);

const clock = new Three.Clock();
clock.start();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

