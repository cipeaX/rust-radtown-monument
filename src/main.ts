import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let canvas: any;
let controls: PointerLockControls;
let renderer: THREE.WebGLRenderer;
let clock: THREE.Clock;

let shiftPressed = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let unlockCooldown = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

function init() {
  scene = new THREE.Scene();
  canvas = document.querySelector('#canvas');
  const blocker = document.querySelector('#blocker') as HTMLElement;
	const instructions = document.querySelector('#instructions') as HTMLElement;
  let instructionTitle = document.querySelector('#instruction-title') as HTMLElement;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    logarithmicDepthBuffer: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 15, 60);

  const light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  const geometry = new THREE.PlaneGeometry( 125, 90);
  const material = new THREE.MeshBasicMaterial( {color: 0x222222, side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );
  plane.rotateX(Math.PI/2)

  controls = new PointerLockControls(camera, renderer.domElement);
  controls.unlock()

  clock = new THREE.Clock();

  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    "RadTown.fbx",
    (object) => {
      object.scale.set(0.01, 0.01, 0.01);
      console.log("Ready");
      scene.add(object);
      scene.add( plane );
      instructionTitle.innerText = "Click to begin.\n\n"
    },
    (xhr) => {
      console.log(parseFloat(((xhr.loaded / xhr.total) * 100).toString()).toFixed(2) + "% loaded");
      let loadingText = "Loading...\n" + parseInt(((xhr.loaded / xhr.total) * 100).toString()) + "%"
      if (loadingText !== instructionTitle.innerText){
        instructionTitle.innerText = loadingText;
      }
    },
    (error) => {
      console.log(error);
    }
  );

  const onKeyDown = function ( event: { code: any; } ) {
    switch ( event.code ) {
      case 'KeyW':
        moveForward = true;
        break;
      case 'KeyA':
        moveLeft = true;
        break;
      case 'KeyS':
        moveBackward = true;
        break;
      case 'KeyD':
        moveRight = true;
        break;
      case 'Space':
        moveUp = true;
        break;
      case 'ControlLeft':
        moveDown = true;
        break;
      case 'ShiftLeft':
        shiftPressed = true;
        break;
    }
  };

  const onKeyUp = function ( event: { code: any; } ) {
    switch ( event.code ) {
      case 'KeyW':
        moveForward = false;
        break;
      case 'KeyA':
        moveLeft = false;
        break;
      case 'KeyS':
        moveBackward = false;
        break;
      case 'KeyD':
        moveRight = false;
        break;
      case 'Space':
        moveUp = false;
        break;
      case 'ControlLeft':
        moveDown = false;
        break;
      case 'ShiftLeft':
        shiftPressed = false;
        break;
    }
  };

  document.addEventListener( 'keydown', onKeyDown );
  document.addEventListener( 'keyup', onKeyUp );

  document.addEventListener("mousedown",()=>{
    if (!unlockCooldown) {
      controls.lock();
      
      blocker.style.display = 'none';
		  instructions.style.display = 'none';
    }
  });
  controls.addEventListener('unlock', () => {
    unlockCooldown = true;
    instructionTitle.innerText = "Click to continue.\n\n"
    blocker.style.display = 'block';
		instructions.style.display = '';
    setTimeout(() => {
      unlockCooldown = false;
    }, 1200)
  });

window.onbeforeunload = function (e) {
  e.preventDefault();
  moveBackward = false;
  moveDown = false;
  moveUp = false;
  moveLeft = false;
  moveRight = false;
  moveForward = false;
};

window.addEventListener( 'resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} );

}

function animate() {
  renderer.render(scene, camera);
  let delta = clock.getDelta();

  if ( controls.isLocked === true ) {

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= velocity.y * 10.0 * delta;

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.y = Number( moveUp ) - Number( moveDown );
    direction.normalize();

    let speed = shiftPressed ? 400.0 : 150.0;

    if ( moveForward || moveBackward ) velocity.z -= direction.z * speed * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * speed * delta;
    if ( moveUp || moveDown ) velocity.y -= direction.y * speed * delta;

    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );
    camera.position.y -= velocity.y * delta;
  }
  requestAnimationFrame(animate);
}

init();
animate();

requestAnimationFrame(animate);
