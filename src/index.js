const THREE = require('three');
import { generate, generateTrees } from './terrain.js';

const ws = new WebSocket('ws://localhost:3420/');

ws.onopen = function open() {
    ws.send('something');
}
  
ws.onmessage = function onMessage() {
    console.log(data);
}

const settings = {
    // Landscape
    scale : 0.05,
    octaves : 2,
    amplitude : 1.75,
    unitSize : 64,
    
    // Camera
    orbitRadius : 10,
    orbitSpeed : 0.2,

    // Sky settings
    skyColour : 0x87CEEB
}

// Create the rendering engine
var scene = new THREE.Scene();
scene.fog = new THREE.Fog(settings.skyColour, settings.unitSize / 4, settings.unitSize / 2);

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.z = 5;
camera.position.y = 3;

camera.lookAt(0, 0, 0);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Setup the scene
var ambient = new THREE.AmbientLight(settings.skyColour, 0.4);
var sunlight = new THREE.DirectionalLight(0xffffcc, 0.5);
sunlight.position.set(-32, 32, 0);

var lightTarget = new THREE.Object3D();
sunlight.target = lightTarget;
sunlight.target.position.set(0, 0, 0);

sunlight.castShadow = true;
sunlight.shadow.camera.near = 1;
sunlight.shadow.camera.far = 50;
sunlight.shadow.bias = 0.001;

sunlight.shadow.mapSize.width = 2048;
sunlight.shadow.mapSize.height = 2048;

var skyGeometry = new THREE.BoxGeometry();
var sphere = new THREE.SphereGeometry();
var groundPlane = new THREE.PlaneGeometry(settings.unitSize, settings.unitSize, settings.unitSize * 2, settings.unitSize * 2);

generate(groundPlane, settings);
groundPlane.rotateX(-Math.PI / 2);

var skyMat = new THREE.MeshBasicMaterial({ color: settings.skyColour, side: THREE.BackSide });
var planeMat = new THREE.MeshStandardMaterial({ color: 0x26c94c });

var sphereMat = new THREE.MeshStandardMaterial({ color: 0xFFFFF });

var sky = new THREE.Mesh( skyGeometry, skyMat );
var plane = new THREE.Mesh( groundPlane, planeMat );
var sphere = new THREE.Mesh( sphere, sphereMat );

sphere.castShadow = true;

plane.receiveShadow = true;

sky.scale.set(50, 50, 50);

generateTrees(plane, 512);

scene.add(sky);
scene.add(plane);
scene.add(sphere);

scene.add(ambient);
scene.add(sunlight);
scene.add(lightTarget);

var clock = new THREE.Clock();

// Request new frames from the renderer every frame
function animate() {
    requestAnimationFrame( animate );

    camera.position.z = Math.sin(clock.getElapsedTime() * settings.orbitSpeed) * settings.orbitRadius;
    camera.position.x = Math.cos(clock.getElapsedTime() * settings.orbitSpeed) * settings.orbitRadius;

    sphere.position.y = Math.sin(clock.getElapsedTime()) + 2;

    camera.lookAt(0, 0, 0);

	renderer.render( scene, camera );
}

animate();