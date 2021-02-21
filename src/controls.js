import { Vector2 } from 'three';

const THREE = require('three');

export class FirstPersonCamera {
  
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.context = dom.getContext('webgl');
    this.mouseDelta = new THREE.Vector2(0, 0);
    
    var _mouseMoveEvent = bind(this, this.mouseMoveEvent);
    var _requestLock = bind(this, this.requestLock);
    var _keyDownEvent = bind(this, this.keyDownEvent);
    var _keyUpEvent = bind(this, this.keyUpEvent);

    this.dom.addEventListener("mousedown", _requestLock, false);
    this.dom.addEventListener("mousemove", _mouseMoveEvent, false);
    this.dom.addEventListener("keydown", _keyDownEvent, false);
    this.dom.addEventListener("keyup", _keyUpEvent, false);
    
    // Mouse sensitivity. Normalize to device coordinates
    this.xSensitivity = 5 / this.dom.width;
    this.ySensitivity = 2.5 / this.dom.height;

    console.log(this.dom.width);
    console.log(this.dom.height);

    // Movement speed
    this.moveSpeed = 10.0;

    // Key down flags
    this.forward = false;
    this.sprinting = false;
    
    function bind( scope, fn ) {
      return function () {
        fn.apply( scope, arguments );
      };
    }
  }
  
  requestLock() {
    this.dom.requestPointerLock = this.dom.requestPointerLock || this.dom.mozRequestPointerLock;
    this.dom.requestPointerLock();
  }

  keyDownEvent(event) {
    
    let code = event.key;

    this.forward = (code === 'w') ? true : this.forward;
    this.sprinting = (code === 'Shift') ? true : this.sprinting;
  }

  keyUpEvent(event) {
    let code = event.key;

    if (code === 'w') {
      this.forward = false;
    }

    if (code === 'Shift') {
      this.sprinting = false;
    }
  }
  
  mouseMoveEvent(event) {
    let delta = new THREE.Vector2(event.movementX, event.movementY);

    this.mouseDelta = delta;
  }
  
  update(delta) {
    
    this.camera.rotateX(-this.mouseDelta.y * this.xSensitivity);
    this.camera.rotateOnWorldAxis(new THREE.Vector3(0, -1, 0), this.mouseDelta.x * this.ySensitivity);

    this.mouseDelta = new THREE.Vector2(0, 0);

    // Move the camera depending on the forward factor
    if (this.forward) {
      let speed = this.moveSpeed * (this.sprinting ? 2.0 : 1.0) * delta;
      this.camera.translateZ(-speed);
    }
  }
  
  setYSensitivity(sens) {
    this.ySensitivity = sens;
  }
  
  setXSensitivity(sens) {
    this.xSensitivity = sens;
  }
}
