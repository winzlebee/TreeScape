const THREE = require('three');
import { generate, generateTrees } from './terrain.js';
import * as CONTROLS from './controls.js';

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

var scene, camera, renderer, controls;

var plane, sphere;

var clock;

function init() {
    // Create the rendering engine
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(settings.skyColour, settings.unitSize / 4, settings.unitSize / 2);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    camera.position.z = 5;
    camera.position.y = 3;

    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    controls = new CONTROLS.FirstPersonCamera(camera, renderer.domElement);

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
    var sphereGeom = new THREE.SphereGeometry();
    var groundPlane = new THREE.PlaneGeometry(settings.unitSize, settings.unitSize, settings.unitSize * 2, settings.unitSize * 2);

    generate(groundPlane, settings);
    groundPlane.rotateX(-Math.PI / 2);

    var skyMat = new THREE.MeshBasicMaterial({ color: settings.skyColour, side: THREE.BackSide });
    var planeMat = new THREE.MeshStandardMaterial({ color: 0x26c94c });

    var sphereMat = new THREE.MeshStandardMaterial({ color: 0xFFFFF });

    var sky = new THREE.Mesh( skyGeometry, skyMat );
    plane = new THREE.Mesh( groundPlane, planeMat );
    sphere = new THREE.Mesh( sphereGeom, sphereMat );

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

    clock = new THREE.Clock();

}

// Request new frames from the renderer every frame
function animate() {
    requestAnimationFrame( animate );

    sphere.position.y = Math.sin(clock.getElapsedTime()) + 2;

    renderer.render( scene, camera );
    
    controls.update(clock.getDelta());
}

init();
animate();