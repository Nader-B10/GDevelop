#!/usr/bin/env python3
"""
GDevelop 3D Editor Components Test Suite
Tests the 3D Gizmo tools and Free Camera functionality in GDevelop IDE
"""

import os
import sys
import json
import subprocess
from pathlib import Path

class GDevelop3DEditorTester:
    def __init__(self):
        self.base_path = Path("/app")
        self.newIDE_path = self.base_path / "newIDE" / "app"
        self.instances_editor_path = self.newIDE_path / "src" / "InstancesEditor"
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []

    def log_test(self, name, passed, message=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {message}")
            self.errors.append(f"{name}: {message}")

    def test_file_existence(self):
        """Test that all required 3D editor files exist"""
        required_files = [
            "Gizmo3DController.js",
            "FreeCameraController.js", 
            "SelectedInstances3D.js",
            "Editor3DToolbar.js",
            "index.js"
        ]
        
        for file_name in required_files:
            file_path = self.instances_editor_path / file_name
            exists = file_path.exists()
            self.log_test(
                f"File existence: {file_name}",
                exists,
                f"File not found at {file_path}" if not exists else ""
            )

    def test_three_js_dependency(self):
        """Test Three.js dependency in package.json"""
        package_json_path = self.newIDE_path / "package.json"
        
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Check if Three.js is in dependencies
            dependencies = package_data.get('dependencies', {})
            has_three = 'three' in dependencies
            three_version = dependencies.get('three', 'Not found')
            
            self.log_test(
                "Three.js dependency",
                has_three,
                f"Three.js not found in dependencies" if not has_three else f"Found Three.js version: {three_version}"
            )
            
            if has_three:
                print(f"   📦 Three.js version: {three_version}")
                
        except Exception as e:
            self.log_test("Three.js dependency", False, f"Error reading package.json: {e}")

    def test_imports_syntax(self):
        """Test that all files have correct import syntax"""
        files_to_check = [
            ("Gizmo3DController.js", ["* as THREE from 'three'", "TransformControls"]),
            ("FreeCameraController.js", ["* as THREE from 'three'"]),
            ("SelectedInstances3D.js", ["* as THREE from 'three'", "Gizmo3DController"]),
            ("Editor3DToolbar.js", ["React"]),
            ("index.js", ["* as THREE from 'three'", "FreeCameraController", "SelectedInstances3D"])
        ]
        
        for file_name, expected_imports in files_to_check:
            file_path = self.instances_editor_path / file_name
            
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                missing_imports = []
                for import_text in expected_imports:
                    if import_text not in content:
                        missing_imports.append(import_text)
                
                passed = len(missing_imports) == 0
                message = f"Missing imports: {missing_imports}" if missing_imports else "All imports found"
                
                self.log_test(f"Imports in {file_name}", passed, message)
                
            except Exception as e:
                self.log_test(f"Imports in {file_name}", False, f"Error reading file: {e}")

    def test_class_definitions(self):
        """Test that classes are properly defined"""
        class_checks = [
            ("Gizmo3DController.js", "export default class Gizmo3DController"),
            ("FreeCameraController.js", "export default class FreeCameraController"),
            ("SelectedInstances3D.js", "export default class SelectedInstances3D"),
            ("Editor3DToolbar.js", "export default function Editor3DToolbar")
        ]
        
        for file_name, class_definition in class_checks:
            file_path = self.instances_editor_path / file_name
            
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                has_class = class_definition in content
                self.log_test(
                    f"Class definition in {file_name}",
                    has_class,
                    f"Class definition not found: {class_definition}" if not has_class else ""
                )
                
            except Exception as e:
                self.log_test(f"Class definition in {file_name}", False, f"Error reading file: {e}")

    def test_gizmo_controller_methods(self):
        """Test that Gizmo3DController has required methods"""
        file_path = self.instances_editor_path / "Gizmo3DController.js"
        
        required_methods = [
            "setObject",
            "setMode", 
            "toggleSpace",
            "setEnabled",
            "isDragging",
            "getCurrentMode",
            "dispose"
        ]
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            missing_methods = []
            for method in required_methods:
                if f"{method}(" not in content and f"{method} =" not in content:
                    missing_methods.append(method)
            
            passed = len(missing_methods) == 0
            message = f"Missing methods: {missing_methods}" if missing_methods else "All methods found"
            
            self.log_test("Gizmo3DController methods", passed, message)
            
        except Exception as e:
            self.log_test("Gizmo3DController methods", False, f"Error reading file: {e}")

    def test_free_camera_methods(self):
        """Test that FreeCameraController has required methods"""
        file_path = self.instances_editor_path / "FreeCameraController.js"
        
        required_methods = [
            "enable",
            "disable",
            "update",
            "setTarget",
            "focusOn",
            "isEnabled",
            "dispose"
        ]
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            missing_methods = []
            for method in required_methods:
                if f"{method}(" not in content and f"{method} =" not in content:
                    missing_methods.append(method)
            
            passed = len(missing_methods) == 0
            message = f"Missing methods: {missing_methods}" if missing_methods else "All methods found"
            
            self.log_test("FreeCameraController methods", passed, message)
            
        except Exception as e:
            self.log_test("FreeCameraController methods", False, f"Error reading file: {e}")

    def test_keyboard_shortcuts(self):
        """Test that keyboard shortcuts are implemented in index.js"""
        file_path = self.instances_editor_path / "index.js"
        
        expected_shortcuts = [
            ("'t'", "translate"),
            ("'r'", "rotate"), 
            ("'s'", "scale"),
            ("'x'", "space")
        ]
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            missing_shortcuts = []
            for key, action in expected_shortcuts:
                if key not in content.lower():
                    missing_shortcuts.append(f"{key} for {action}")
            
            passed = len(missing_shortcuts) == 0
            message = f"Missing shortcuts: {missing_shortcuts}" if missing_shortcuts else "All shortcuts found"
            
            self.log_test("Keyboard shortcuts", passed, message)
            
        except Exception as e:
            self.log_test("Keyboard shortcuts", False, f"Error reading file: {e}")

    def test_toolbar_props(self):
        """Test that Editor3DToolbar has correct props"""
        file_path = self.instances_editor_path / "Editor3DToolbar.js"
        
        expected_props = [
            "gizmoMode",
            "onGizmoModeChange",
            "freeCameraEnabled", 
            "onFreeCameraToggle",
            "gizmoEnabled",
            "onGizmoToggle",
            "onToggleGizmoSpace",
            "gizmoSpace"
        ]
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            missing_props = []
            for prop in expected_props:
                if prop not in content:
                    missing_props.append(prop)
            
            passed = len(missing_props) == 0
            message = f"Missing props: {missing_props}" if missing_props else "All props found"
            
            self.log_test("Editor3DToolbar props", passed, message)
            
        except Exception as e:
            self.log_test("Editor3DToolbar props", False, f"Error reading file: {e}")

    def test_integration_in_main_editor(self):
        """Test that 3D components are integrated in main editor"""
        file_path = self.instances_editor_path / "index.js"
        
        integration_checks = [
            "FreeCameraController",
            "SelectedInstances3D", 
            "Editor3DToolbar",
            "_initialize3DControllers",
            "_freeCameraController",
            "_selectedInstances3D"
        ]
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            missing_integrations = []
            for check in integration_checks:
                if check not in content:
                    missing_integrations.append(check)
            
            passed = len(missing_integrations) == 0
            message = f"Missing integrations: {missing_integrations}" if missing_integrations else "All integrations found"
            
            self.log_test("3D components integration", passed, message)
            
        except Exception as e:
            self.log_test("3D components integration", False, f"Error reading file: {e}")

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting GDevelop 3D Editor Components Test Suite")
        print("=" * 60)
        
        # Test file structure
        print("\n📁 Testing File Structure...")
        self.test_file_existence()
        
        # Test dependencies
        print("\n📦 Testing Dependencies...")
        self.test_three_js_dependency()
        
        # Test code structure
        print("\n🔍 Testing Code Structure...")
        self.test_imports_syntax()
        self.test_class_definitions()
        
        # Test functionality
        print("\n⚙️ Testing Functionality...")
        self.test_gizmo_controller_methods()
        self.test_free_camera_methods()
        self.test_keyboard_shortcuts()
        self.test_toolbar_props()
        
        # Test integration
        print("\n🔗 Testing Integration...")
        self.test_integration_in_main_editor()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.errors:
            print("\n❌ Errors found:")
            for error in self.errors:
                print(f"   • {error}")
        else:
            print("\n✅ All tests passed! The 3D editor components are properly implemented.")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test function"""
    tester = GDevelop3DEditorTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())