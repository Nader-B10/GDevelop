// @flow
import * as THREE from 'three';

type Props = {|
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  target?: THREE.Vector3,
  enableKeys?: boolean,
|};

/**
 * Free camera controller for 3D scene navigation
 * Supports orbit controls with mouse and keyboard movement
 */
export default class FreeCameraController {
  _camera: THREE.Camera;
  _renderer: THREE.WebGLRenderer;
  _domElement: HTMLElement;
  _target: THREE.Vector3;
  
  // Mouse state
  _isMouseDown: boolean = false;
  _mouseButton: number = 0;
  _lastMousePosition: { x: number, y: number } = { x: 0, y: 0 };
  
  // Camera state
  _spherical: THREE.Spherical;
  _sphericalTarget: THREE.Spherical;
  _distance: number = 10;
  _targetDistance: number = 10;
  
  // Keyboard state
  _keys: { [string]: boolean } = {};
  _keyMoveSpeed: number = 0.5;
  
  // Settings
  _enableKeys: boolean = true;
  _enableRotate: boolean = true;
  _enableZoom: boolean = true;
  _enablePan: boolean = true;
  
  // Rotation speed
  _rotateSpeed: number = 1.0;
  _zoomSpeed: number = 1.0;
  _panSpeed: number = 1.0;
  
  // Limits
  _minDistance: number = 0.1;
  _maxDistance: number = 1000;
  _minPolarAngle: number = 0; // radians
  _maxPolarAngle: number = Math.PI; // radians
  
  _isEnabled: boolean = false;

  constructor({ camera, renderer, target, enableKeys = true }: Props) {
    this._camera = camera;
    this._renderer = renderer;
    this._domElement = renderer.domElement;
    this._target = target || new THREE.Vector3();
    this._enableKeys = enableKeys;
    
    // Initialize spherical coordinates
    this._spherical = new THREE.Spherical();
    this._sphericalTarget = new THREE.Spherical();
    
    this._updateSphericalFromCamera();
    
    // Bind event listeners
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
  }

  _updateSphericalFromCamera() {
    const offset = new THREE.Vector3();
    offset.copy(this._camera.position).sub(this._target);
    this._spherical.setFromVector3(offset);
    this._sphericalTarget.copy(this._spherical);
    this._distance = this._targetDistance = offset.length();
  }

  _onMouseDown(event: MouseEvent) {
    if (!this._isEnabled) return;
    
    this._isMouseDown = true;
    this._mouseButton = event.button;
    this._lastMousePosition.x = event.clientX;
    this._lastMousePosition.y = event.clientY;
    
    event.preventDefault();
  }

  _onMouseMove(event: MouseEvent) {
    if (!this._isEnabled || !this._isMouseDown) return;
    
    const deltaX = event.clientX - this._lastMousePosition.x;
    const deltaY = event.clientY - this._lastMousePosition.y;
    
    if (this._mouseButton === 0) {
      // Left mouse button - rotate
      if (this._enableRotate) {
        this._sphericalTarget.theta -= deltaX * this._rotateSpeed * 0.01;
        this._sphericalTarget.phi += deltaY * this._rotateSpeed * 0.01;
        
        // Limit phi angle
        this._sphericalTarget.phi = Math.max(
          this._minPolarAngle,
          Math.min(this._maxPolarAngle, this._sphericalTarget.phi)
        );
      }
    } else if (this._mouseButton === 2) {
      // Right mouse button - pan
      if (this._enablePan) {
        this._pan(deltaX, deltaY);
      }
    } else if (this._mouseButton === 1) {
      // Middle mouse button - zoom
      if (this._enableZoom) {
        this._targetDistance += deltaY * this._zoomSpeed * 0.05;
        this._targetDistance = Math.max(this._minDistance, Math.min(this._maxDistance, this._targetDistance));
      }
    }
    
    this._lastMousePosition.x = event.clientX;
    this._lastMousePosition.y = event.clientY;
    
    event.preventDefault();
  }

  _onMouseUp(event: MouseEvent) {
    if (!this._isEnabled) return;
    
    this._isMouseDown = false;
    event.preventDefault();
  }

  _onWheel(event: WheelEvent) {
    if (!this._isEnabled || !this._enableZoom) return;
    
    this._targetDistance += event.deltaY * this._zoomSpeed * 0.01;
    this._targetDistance = Math.max(this._minDistance, Math.min(this._maxDistance, this._targetDistance));
    
    event.preventDefault();
  }

  _pan(deltaX: number, deltaY: number) {
    const offset = new THREE.Vector3();
    offset.copy(this._camera.position).sub(this._target);
    
    // Calculate pan vector
    const panLeft = new THREE.Vector3();
    const panUp = new THREE.Vector3();
    const panOffset = new THREE.Vector3();
    
    // Get camera's right and up vectors
    panLeft.setFromMatrixColumn(this._camera.matrix, 0); // get X column
    panUp.setFromMatrixColumn(this._camera.matrix, 1); // get Y column
    
    panLeft.multiplyScalar(-deltaX * this._panSpeed * 0.01);
    panUp.multiplyScalar(deltaY * this._panSpeed * 0.01);
    
    panOffset.copy(panLeft).add(panUp);
    this._target.add(panOffset);
  }

  _onKeyDown(event: KeyboardEvent) {
    if (!this._isEnabled || !this._enableKeys) return;
    
    this._keys[event.code] = true;
  }

  _onKeyUp(event: KeyboardEvent) {
    if (!this._isEnabled || !this._enableKeys) return;
    
    this._keys[event.code] = false;
  }

  _onContextMenu(event: Event) {
    event.preventDefault();
  }

  _updateKeyboardMovement() {
    if (!this._enableKeys) return;
    
    const moveVector = new THREE.Vector3();
    
    // WASD movement
    if (this._keys['KeyW']) moveVector.z -= this._keyMoveSpeed;
    if (this._keys['KeyS']) moveVector.z += this._keyMoveSpeed;
    if (this._keys['KeyA']) moveVector.x -= this._keyMoveSpeed;
    if (this._keys['KeyD']) moveVector.x += this._keyMoveSpeed;
    if (this._keys['KeyQ']) moveVector.y -= this._keyMoveSpeed; // Down
    if (this._keys['KeyE']) moveVector.y += this._keyMoveSpeed; // Up
    
    if (moveVector.length() > 0) {
      // Transform movement vector to camera space
      moveVector.applyQuaternion(this._camera.quaternion);
      this._target.add(moveVector);
    }
  }

  /**
   * Enable the camera controller
   */
  enable() {
    if (this._isEnabled) return;
    
    this._isEnabled = true;
    this._domElement.addEventListener('mousedown', this._onMouseDown);
    this._domElement.addEventListener('mousemove', this._onMouseMove);
    this._domElement.addEventListener('mouseup', this._onMouseUp);
    this._domElement.addEventListener('wheel', this._onWheel);
    this._domElement.addEventListener('contextmenu', this._onContextMenu);
    
    if (this._enableKeys) {
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
    }
  }

  /**
   * Disable the camera controller
   */
  disable() {
    if (!this._isEnabled) return;
    
    this._isEnabled = false;
    this._domElement.removeEventListener('mousedown', this._onMouseDown);
    this._domElement.removeEventListener('mousemove', this._onMouseMove);
    this._domElement.removeEventListener('mouseup', this._onMouseUp);
    this._domElement.removeEventListener('wheel', this._onWheel);
    this._domElement.removeEventListener('contextmenu', this._onContextMenu);
    
    if (this._enableKeys) {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
  }

  /**
   * Update the camera position (call this in render loop)
   */
  update() {
    if (!this._isEnabled) return;
    
    this._updateKeyboardMovement();
    
    // Smooth interpolation
    const dampingFactor = 0.1;
    
    this._spherical.theta += (this._sphericalTarget.theta - this._spherical.theta) * dampingFactor;
    this._spherical.phi += (this._sphericalTarget.phi - this._spherical.phi) * dampingFactor;
    this._distance += (this._targetDistance - this._distance) * dampingFactor;
    
    this._spherical.radius = this._distance;
    
    // Convert spherical to cartesian
    const offset = new THREE.Vector3();
    offset.setFromSpherical(this._spherical);
    
    this._camera.position.copy(this._target).add(offset);
    this._camera.lookAt(this._target);
  }

  /**
   * Set the target position
   */
  setTarget(x: number, y: number, z: number) {
    this._target.set(x, y, z);
  }

  /**
   * Focus the camera on a specific point
   */
  focusOn(position: THREE.Vector3, distance?: number) {
    this._target.copy(position);
    
    if (distance !== undefined) {
      this._targetDistance = distance;
      this._distance = distance;
    }
    
    this._updateSphericalFromCamera();
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Dispose of the controller
   */
  dispose() {
    this.disable();
  }
}