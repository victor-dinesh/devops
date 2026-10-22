import React from 'react';
import { Workflow, Play, Sparkles } from 'lucide-react';

interface NavbarProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenTriggerModal: () => void;
  buildsCount: number;
  apiConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDemoMode,
  onToggleDemoMode,
  onOpenTriggerModal,
  buildsCount,
  apiConnected = false,
}) => {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-logo-glow">
          <Workflow size={24} />
        </div>
        <div className="brand-text">
          <h1>AutoPipeline DevOps</h1>
          <div className="brand-subline">
            <span className="college-badge">College Capstone</span>
            <span>CI/CD Automation & Build Telemetry</span>
          </div>
        </div>
      </div>

      <div className="nav-actions">
        <div className="nav-stat-chip">
          <span 
            className="live-indicator" 
            style={{ backgroundColor: apiConnected ? '#10b981' : (isDemoMode ? '#818cf8' : '#f59e0b') }}
          ></span>
          <span>Backend: <strong>{apiConnected ? 'FastAPI (Port 8000)' : (isDemoMode ? 'Demo Sandbox' : 'Connecting...')}</strong></span>
        </div>

        <div className="nav-stat-chip">
          <span>Builds Run: <strong>#{buildsCount}</strong></span>
        </div>

        <button 
          className="demo-mode-toggle"
          onClick={onToggleDemoMode}
          title="Toggle between Demo Mock Data and Live FastAPI Backend"
        >
          <Sparkles size={14} color={isDemoMode ? '#818cf8' : '#94a3b8'} />
          <span>{isDemoMode ? 'Demo Data Mode' : 'Live API Mode'}</span>
        </button>

        <button 
          className="btn-primary"
          onClick={onOpenTriggerModal}
          id="btn-trigger-pipeline-nav"
        >
          <Play size={16} fill="currentColor" />
          <span>Run Pipeline</span>
        </button>
      </div>
    </header>
  );
};
