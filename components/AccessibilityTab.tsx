
import React from 'react';
import { AccessibilityMode } from '../types';

interface AccessibilityTabProps {
  currentMode: AccessibilityMode;
  onModeChange: (mode: AccessibilityMode) => void;
}

export const AccessibilityTab: React.FC<AccessibilityTabProps> = ({ currentMode, onModeChange }) => {
  const presets = [
    { id: AccessibilityMode.NORMAL, label: 'Standard View', icon: '🌐', desc: 'No modifications' },
    { id: AccessibilityMode.HIGH_CONTRAST, label: 'High Contrast', icon: '👁️', desc: 'Sharper visibility' },
    { id: AccessibilityMode.DARK_MODE, label: 'Dark Mode', icon: '🌙', desc: 'Easier on the eyes' },
    { id: AccessibilityMode.GRAYSCALE, label: 'Grayscale', icon: '🔳', desc: 'Remove distractions' }
  ];

  const colorBlindness = [
    { id: AccessibilityMode.PROTANOPIA, label: 'Protanopia', desc: 'Red-blind' },
    { id: AccessibilityMode.DEUTERANOPIA, label: 'Deuteranopia', desc: 'Green-blind' },
    { id: AccessibilityMode.TRITANOPIA, label: 'Tritanopia', desc: 'Blue-blind' }
  ];

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto bg-white/50">
      <section>
        <h3 className="font-bold text-gray-900 text-sm mb-4">Visual Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 group relative overflow-hidden ${currentMode === mode.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                }`}
            >
              <div className={`text-2xl mb-3 transition-transform duration-300 ${currentMode === mode.id ? 'scale-110' : 'group-hover:scale-110'}`}>{mode.icon}</div>
              <div className="font-bold text-sm text-gray-900 mb-0.5">{mode.label}</div>
              <div className="text-[10px] text-gray-500 font-medium">{mode.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">Color Blindness Filters</h3>
          <span className="text-[9px] text-indigo-600 font-black bg-indigo-100 px-2 py-1 rounded-md uppercase tracking-wider">Simulation</span>
        </div>
        <div className="space-y-3">
          {colorBlindness.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${currentMode === mode.id
                  ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600'
                  : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
            >
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900">{mode.label}</div>
                <div className="text-[11px] text-gray-400 font-medium">{mode.desc}</div>
              </div>
              {currentMode === mode.id && <span className="text-indigo-600 text-xl font-bold">✓</span>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
