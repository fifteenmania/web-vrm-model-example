import { WebGLRenderer, sRGBEncoding, Scene, DirectionalLight, PerspectiveCamera, Group, GridHelper, Clock, AxesHelper } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import AvatarSample from '../assets/model/AvatarSample_B.vrm';
//import MotionSample from '../assets/fbx/Defeated.fbx';

const renderer = new WebGLRenderer();
renderer.outputEncoding = sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 2000 );
camera.position.set(0, 1.6, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0, 1, 0);
controls.update();

const scene = new Scene();

const light = new DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1).normalize();
scene.add(light);

const helperRoot = new Group();
helperRoot.renderOrder = 10000;
scene.add(helperRoot);

let currentVrm = null;
const loader = new GLTFLoader();
loader.crossOrigin = 'anonymous';
loader.register(parser => new VRMLoaderPlugin(parser));
loader.load(AvatarSample, gltf => {
    const vrm = gltf.userData.vrm;
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.removeUnnecessaryJoints(gltf.scene);
    VRMUtils.rotateVRM0(vrm);
    vrm.scene.traverse((obj) => {
      obj.frustumCulled = false;
    })
    scene.add(vrm.scene);
    currentVrm = vrm;
    console.log(vrm);
  },
  (progress) => {
    console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%');
  },
  (error) => {
    console.log('An error happened', error);
});


const gridHelper = new GridHelper(10, 10);
scene.add(gridHelper);

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

const clock = new Clock();
clock.start();

function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  if (currentVrm) {
    const amplitude = 0.15 * Math.PI;
    const s = amplitude * Math.sin(Math.PI * 2 * clock.elapsedTime)
    currentVrm.humanoid.getNormalizedBoneNode('neck').rotation.x = s;
    currentVrm.humanoid.getNormalizedBoneNode('leftShoulder').rotation.z = s;
    currentVrm.humanoid.getNormalizedBoneNode('rightShoulder').rotation.z = -s;
    currentVrm.humanoid.getNormalizedBoneNode('hips').rotation.x = -s;
    currentVrm.humanoid.getNormalizedBoneNode('leftUpperLeg').rotation.z = -s - amplitude;
    currentVrm.humanoid.getNormalizedBoneNode('rightUpperLeg').rotation.z = s + amplitude;
    currentVrm.update(deltaTime);
  }
  renderer.render(scene, camera);
}

animate();

