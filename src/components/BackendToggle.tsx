import React from 'react';
import { Server, Zap } from 'lucide-react';

interface BackendToggleProps {
  useRenderBackend: boolean;
  onToggle: (useRender: boolean) => void;
  renderHealthy: boolean;
}

export const BackendToggle: React.FC<BackendToggleProps> = ({ 
  useRenderBackend, 
  onToggle, 
  renderHealthy 
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2">Research Backend</div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggle(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              !useRenderBackend 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Netlify (Fast)
          </button>
          <button
            onClick={() => onToggle(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
              useRenderBackend 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Render (Enhanced)
            {!renderHealthy && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>
        {useRenderBackend && !renderHealthy && (
          <p className="text-xs text-yellow-600 mt-2">
            Render backend offline, using fallback
          </p>
        )}
      </div>
    </div>
  );
};