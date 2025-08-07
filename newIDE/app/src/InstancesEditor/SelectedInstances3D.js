// @flow
import * as THREE from 'three';
import Gizmo3DController from './Gizmo3DController';

type Props = {|
  threeRenderer: THREE.WebGLRenderer | null,
  threeCamera: THREE.Camera | null,
  threeScene: THREE.Scene | null,
  onInstanceTransformed: (instance: gdInitialInstance, transformType: string) => void,
|};

/**
 * Manages 3D gizmo controls for selected instances
 */
export default class SelectedInstances3D {
  _gizmoController: Gizmo3DController | null = null;
  _selectedInstances: Array<gdInitialInstance> = [];
  _onInstanceTransformed: (instance: gdInitialInstance, transformType: string) => void;
  _instanceToObjectMap: Map<gdInitialInstance, THREE.Object3D> = new Map();
  _currentMode: 'translate' | 'rotate' | 'scale' = 'translate';
  _enabled: boolean = false;

  constructor({ threeRenderer, threeCamera, threeScene, onInstanceTransformed }: Props) {
    this._onInstanceTransformed = onInstanceTransformed;
    
    if (threeRenderer && threeCamera && threeScene) {
      this._gizmoController = new Gizmo3DController({
        threeRenderer,
        threeCamera,
        threeScene,
        onObjectChanged: this._onObjectChanged,
      });
    }
  }

  _onObjectChanged = (object: THREE.Object3D, transformType: string) => {
    // Find the instance associated with this object
    const instance = this._findInstanceForObject(object);
    if (!instance) return;

    // Update the GDevelop instance based on object transformation
    if (object.userData.needsUpdate) {
      const { position, rotation, scale } = object.userData;
      
      if (transformType === 'translate' && position) {
        // Update instance position (accounting for object center)
        instance.setX(position.x - instance.getWidth() / 2);
        instance.setY(position.y - instance.getHeight() / 2);
        
        // Check if it's a 3D object and update Z position
        if (instance.hasCustomSize && instance.setZ) {
          instance.setZ(position.z - (instance.getDepth ? instance.getDepth() : 0) / 2);
        }
      } else if (transformType === 'rotate' && rotation) {
        // Update instance rotation
        if (instance.setAngle) {
          instance.setAngle(rotation.z * 180 / Math.PI);
        }
        if (instance.setRotationX) {
          instance.setRotationX(rotation.x * 180 / Math.PI);
        }
        if (instance.setRotationY) {
          instance.setRotationY(rotation.y * 180 / Math.PI);
        }
      } else if (transformType === 'scale' && scale) {
        // Update instance scale/size
        const originalWidth = instance._getOriginalWidth ? instance._getOriginalWidth() : instance.getWidth();
        const originalHeight = instance._getOriginalHeight ? instance._getOriginalHeight() : instance.getHeight();
        
        instance.setWidth(originalWidth * Math.abs(scale.x));
        instance.setHeight(originalHeight * Math.abs(scale.y));
        
        if (instance.setDepth && instance._getOriginalDepth) {
          const originalDepth = instance._getOriginalDepth();
          instance.setDepth(originalDepth * Math.abs(scale.z));
        }
      }
      
      // Clear update flag
      object.userData.needsUpdate = false;
      
      // Notify that instance was transformed
      this._onInstanceTransformed(instance, transformType);
    }
  };

  _findInstanceForObject(object: THREE.Object3D): gdInitialInstance | null {
    for (const [instance, obj] of this._instanceToObjectMap) {
      if (obj === object || obj.parent === object || this._isChildOf(obj, object)) {
        return instance;
      }
    }
    return null;
  }

  _isChildOf(child: THREE.Object3D, parent: THREE.Object3D): boolean {
    let current = child.parent;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }

  /**
   * Update selected instances and their 3D objects
   */
  updateSelection(instances: Array<gdInitialInstance>, instanceToObjectMap: Map<gdInitialInstance, THREE.Object3D>) {
    this._selectedInstances = instances;
    this._instanceToObjectMap = instanceToObjectMap;
    
    if (!this._gizmoController) return;
    
    // For now, only support single selection with gizmo
    if (instances.length === 1 && this._enabled) {
      const object = instanceToObjectMap.get(instances[0]);
      if (object) {
        this._gizmoController.setObject(object);
      } else {
        this._gizmoController.setObject(null);
      }
    } else {
      this._gizmoController.setObject(null);
    }
  }

  /**
   * Set the gizmo mode
   */
  setMode(mode: 'translate' | 'rotate' | 'scale') {
    this._currentMode = mode;
    if (this._gizmoController) {
      this._gizmoController.setMode(mode);
    }
  }

  /**
   * Toggle gizmo space between local and world
   */
  toggleSpace() {
    if (this._gizmoController) {
      this._gizmoController.toggleSpace();
    }
  }

  /**
   * Enable/disable the gizmo
   */
  setEnabled(enabled: boolean) {
    this._enabled = enabled;
    if (this._gizmoController) {
      this._gizmoController.setEnabled(enabled);
      
      // Update selection to show/hide gizmo
      if (enabled && this._selectedInstances.length === 1) {
        const object = this._instanceToObjectMap.get(this._selectedInstances[0]);
        if (object) {
          this._gizmoController.setObject(object);
        }
      } else if (!enabled) {
        this._gizmoController.setObject(null);
      }
    }
  }

  /**
   * Check if gizmo is currently being used
   */
  isDragging(): boolean {
    return this._gizmoController ? this._gizmoController.isDragging() : false;
  }

  /**
   * Get current mode
   */
  getCurrentMode(): 'translate' | 'rotate' | 'scale' {
    return this._currentMode;
  }

  /**
   * Get current space (local or world)
   */
  getCurrentSpace(): 'local' | 'world' {
    return this._gizmoController ? this._gizmoController._transformControls.getSpace() : 'local';
  }

  /**
   * Check if 3D controls are available
   */
  isAvailable(): boolean {
    return this._gizmoController !== null;
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this._gizmoController) {
      this._gizmoController.dispose();
      this._gizmoController = null;
    }
    this._instanceToObjectMap.clear();
  }
}