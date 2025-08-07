// @flow
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

type Props = {|
  threeRenderer: THREE.WebGLRenderer,
  threeCamera: THREE.Camera,
  threeScene: THREE.Scene,
  onObjectChanged: (object: THREE.Object3D, property: string) => void,
|};

/**
 * Gizmo controller for 3D objects using Three.js TransformControls
 */
export default class Gizmo3DController {
  _threeRenderer: THREE.WebGLRenderer;
  _threeCamera: THREE.Camera;
  _threeScene: THREE.Scene;
  _transformControls: TransformControls;
  _onObjectChanged: (object: THREE.Object3D, property: string) => void;
  _currentObject: THREE.Object3D | null = null;
  _currentMode: 'translate' | 'rotate' | 'scale' = 'translate';
  _isEnabled: boolean = false;
  
  constructor({ threeRenderer, threeCamera, threeScene, onObjectChanged }: Props) {
    this._threeRenderer = threeRenderer;
    this._threeCamera = threeCamera;
    this._threeScene = threeScene;
    this._onObjectChanged = onObjectChanged;
    
    // Create transform controls
    this._transformControls = new TransformControls(threeCamera, threeRenderer.domElement);
    this._transformControls.setMode('translate');
    this._transformControls.setSize(0.8);
    this._transformControls.setSpace('local');
    
    // Add event listeners
    this._transformControls.addEventListener('change', this._onControlsChange);
    this._transformControls.addEventListener('objectChange', this._onObjectChange);
    
    this._threeScene.add(this._transformControls);
  }

  _onControlsChange = () => {
    // Request render update when controls change
    if (this._currentObject) {
      this._updateObject3DFromControls();
    }
  };

  _onObjectChange = () => {
    // Called when object transformation is complete
    if (this._currentObject) {
      this._onObjectChanged(this._currentObject, this._currentMode);
    }
  };

  _updateObject3DFromControls() {
    if (!this._currentObject) return;
    
    // The transform controls modify the object directly
    // We need to ensure the changes are reflected in the GDevelop object
    const position = this._currentObject.position;
    const rotation = this._currentObject.rotation;
    const scale = this._currentObject.scale;
    
    // These values will be used by the caller to update the GDevelop instance
    this._currentObject.userData.needsUpdate = true;
    this._currentObject.userData.position = { x: position.x, y: position.y, z: position.z };
    this._currentObject.userData.rotation = { x: rotation.x, y: rotation.y, z: rotation.z };
    this._currentObject.userData.scale = { x: scale.x, y: scale.y, z: scale.z };
  }

  /**
   * Set the object to be controlled by the gizmo
   */
  setObject(object: THREE.Object3D | null) {
    this._currentObject = object;
    this._transformControls.detach();
    
    if (object && this._isEnabled) {
      this._transformControls.attach(object);
    }
  }

  /**
   * Set the gizmo mode (translate, rotate, scale)
   */
  setMode(mode: 'translate' | 'rotate' | 'scale') {
    this._currentMode = mode;
    this._transformControls.setMode(mode);
  }

  /**
   * Toggle gizmo space between 'local' and 'world'
   */
  toggleSpace() {
    const currentSpace = this._transformControls.getSpace();
    this._transformControls.setSpace(currentSpace === 'local' ? 'world' : 'local');
  }

  /**
   * Enable or disable the gizmo
   */
  setEnabled(enabled: boolean) {
    this._isEnabled = enabled;
    this._transformControls.enabled = enabled;
    this._transformControls.visible = enabled;
    
    if (!enabled) {
      this._transformControls.detach();
    } else if (this._currentObject) {
      this._transformControls.attach(this._currentObject);
    }
  }

  /**
   * Check if gizmo is currently being used
   */
  isDragging(): boolean {
    return this._transformControls.dragging;
  }

  /**
   * Get the current mode
   */
  getCurrentMode(): 'translate' | 'rotate' | 'scale' {
    return this._currentMode;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this._transformControls.removeEventListener('change', this._onControlsChange);
    this._transformControls.removeEventListener('objectChange', this._onObjectChange);
    this._threeScene.remove(this._transformControls);
    this._transformControls.dispose();
  }
}