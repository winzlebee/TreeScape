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
    this.dom.addEventListener("mousedown", _requestLock, false);
    this.dom.addEventListener("mousemove", _mouseMoveEvent, false);
    
    this.xSensitivity = 1e-3;
    this.ySensitivity = 1e-3;
    
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
  
  mouseMoveEvent(event) {
    this.mouseDelta = new THREE.Vector2(event.movementX, event.movementY);
  }
  
  update(delta) {
    
    if (this.mouseDelta.lengthSq() < 5) {
      return;
    }
    
    this.camera.rotateX(-this.mouseDelta.y * this.xSensitivity);
    this.camera.rotateOnWorldAxis(new THREE.Vector3(0, -1, 0), this.mouseDelta.x * this.ySensitivity);
  }
  
  setYSensitivity(sens) {
    this.ySensitivity = sens;
  }
  
  setXSensitivity(sens) {
    this.xSensitivity = sens;
  }
}
