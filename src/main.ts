import * as THREE from "three";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import TextSprite from "@seregpie/three.text-sprite";

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let canvas: any;
let controls: FirstPersonControls;
let renderer: THREE.WebGLRenderer;
let clock: THREE.Clock;

let ctrlPressed = false;
let spacePressed = false;

const finishedLoading = new Event("finishedloading");

init();
animate();

function init() {
  scene = new THREE.Scene();
  canvas = document.querySelector("#canvas");

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

  let loadingSprite = new TextSprite({
    text: "Loading...\n0%",
    alignment: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 10,
    color: "#ffffff",
  });
  scene.add(loadingSprite);

  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.lookSpeed = 0.1;
  controls.movementSpeed = 20;
  controls.enabled = false;

  clock = new THREE.Clock();

  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    "RadTown.fbx",
    (object) => {
      object.scale.set(0.01, 0.01, 0.01);
      console.log("Ready");
      document.dispatchEvent(finishedLoading)
      scene.add(object);
      scene.remove(loadingSprite);
    },
    (xhr) => {
      console.log(
        parseFloat(((xhr.loaded / xhr.total) * 100).toString()).toFixed(2) +
          "% loaded"
      );
      let loadingText = "Loading...\n" + parseInt(((xhr.loaded / xhr.total) * 100).toString()) + "%"
      if (loadingText !== loadingSprite.text){
        loadingSprite.text = loadingText
      }
    },
    (error) => {
      console.log(error);
    }
  );

  const light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  document.addEventListener("keydown", (pressed) => {
    if (pressed.key === " ") {
      spacePressed = true;
    } else if (pressed.key === "Control") {
      ctrlPressed = true;
    } else if (pressed.key === "Escape") {
      controls.enabled = false;
    } else if (pressed.repeat) return;
    else if (pressed.key === "Shift") {
      controls.movementSpeed = 100;
    }
  });
  document.addEventListener("keyup", (pressed) => {
    if (pressed.key === " ") {
      spacePressed = false;
    } else if (pressed.key === "Shift") {
      controls.movementSpeed = 10;
    } else if (pressed.key === "Control") {
      ctrlPressed = false;
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  });
  document.addEventListener("finishedloading", () => {
    setTimeout(()=>{
      document.addEventListener("mousedown",()=>{
        controls.enabled = true
      })
    },1)
  });
}

function animate() {
  renderer.render(scene, camera);
  let delta = clock.getDelta();
  controls.update(delta);
  if (spacePressed) {
    camera.position.y += 5 * delta;
  }
  if (ctrlPressed) {
    camera.position.y -= 5 * delta;
  }
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
