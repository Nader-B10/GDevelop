// @flow
import React from 'react';
import Toolbar from '../UI/Toolbar';
import IconButton from '../UI/IconButton';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import { Tooltip } from '../UI/Tooltip';

// Icons for the toolbar - using existing GDevelop icons
const TranslateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M7 18.5C7 17.12 8.12 16 9.5 16S12 17.12 12 18.5 10.88 21 9.5 21 7 19.88 7 18.5M17 18.5C17 17.12 18.12 16 19.5 16S22 17.12 22 18.5 20.88 21 19.5 21 17 19.88 17 18.5Z"/>
  </svg>
);

const RotateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V2C13.1 2 14.12 2.37 14.96 3L16.71 1.25L18.12 2.66L16.37 4.41C17.5 5.6 18.22 7.2 18.22 9H16.22C16.22 7.89 15.85 6.89 15.22 6.11L12 9.33V7C8.69 7 6 9.69 6 13S8.69 19 12 19V21C7.58 21 4 17.42 4 13S7.58 5 12 5V4M12 9.33L15.22 6.11C15.85 6.89 16.22 7.89 16.22 9C16.22 10.11 15.85 11.11 15.22 11.89L12 8.67V9.33Z"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 7V3H17V5H19V7H21M17 21H21V17H19V19H17V21M7 3V7H9V5H11V3H7M9 17V19H7V21H11V17H9M16 12L12 8L8 12L12 16L16 12Z"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 9V7L15 9L17 11V9.5H20V8.5H17V9M4 6H2V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V18H18V20H4V6M22 4V16H10V4H22M20 14V6H12V14H20Z"/>
  </svg>
);

type Props = {|
  gizmoMode: 'translate' | 'rotate' | 'scale',
  onGizmoModeChange: ('translate' | 'rotate' | 'scale') => void,
  freeCameraEnabled: boolean,
  onFreeCameraToggle: () => void,
  gizmoEnabled: boolean,
  onGizmoToggle: () => void,
  onToggleGizmoSpace: () => void,
  gizmoSpace: 'local' | 'world',
|};

/**
 * Toolbar for 3D editing tools (Gizmo controls and camera)
 */
export default function Editor3DToolbar({
  gizmoMode,
  onGizmoModeChange,
  freeCameraEnabled,
  onFreeCameraToggle,
  gizmoEnabled,
  onGizmoToggle,
  onToggleGizmoSpace,
  gizmoSpace,
}: Props) {
  return (
    <Toolbar>
      <Tooltip title="Toggle 3D Gizmo">
        <IconButton
          selected={gizmoEnabled}
          onClick={onGizmoToggle}
          size="small"
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>
      
      <ToolbarSeparator />
      
      <Tooltip title="Translate Mode (T)">
        <IconButton
          selected={gizmoMode === 'translate'}
          onClick={() => onGizmoModeChange('translate')}
          disabled={!gizmoEnabled}
          size="small"
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Rotate Mode (R)">
        <IconButton
          selected={gizmoMode === 'rotate'}
          onClick={() => onGizmoModeChange('rotate')}
          disabled={!gizmoEnabled}
          size="small"
        >
          <RotateIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Scale Mode (S)">
        <IconButton
          selected={gizmoMode === 'scale'}
          onClick={() => onGizmoModeChange('scale')}
          disabled={!gizmoEnabled}
          size="small"
        >
          <ScaleIcon />
        </IconButton>
      </Tooltip>
      
      <ToolbarSeparator />
      
      <Tooltip title={`Toggle Gizmo Space: ${gizmoSpace} (X)`}>
        <IconButton
          onClick={onToggleGizmoSpace}
          disabled={!gizmoEnabled}
          size="small"
        >
          {gizmoSpace === 'local' ? 'L' : 'W'}
        </IconButton>
      </Tooltip>
      
      <ToolbarSeparator />
      
      <Tooltip title="Free Camera Mode">
        <IconButton
          selected={freeCameraEnabled}
          onClick={onFreeCameraToggle}
          size="small"
        >
          <CameraIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}