import React, { useState } from 'react';
import { X, Play, GitBranch, Shield, Boxes, AlertCircle } from 'lucide-react';
import type { Pipeline } from '../types/pipeline';

interface TriggerBuildModalProps {
  pipelines: Pipeline[];
  initialPipelineId?: string;
  onClose: () => void;
  onTrigger: (pipelineId: string, options: TriggerOptions) => void;
}

export interface TriggerOptions {
  branch: string;
  environment: 'staging' | 'production' | 'local';
  runSecurityScan: boolean;
  deployContainer: boolean;
  simulateFailure: boolean;
}

export const TriggerBuildModal: React.FC<TriggerBuildModalProps> = ({
  pipelines,
  initialPipelineId,
  onClose,
  onTrigger,
}) => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    initialPipelineId || pipelines[0]?.id || ''
  );
  const [branch, setBranch] = useState('main');
  const [environment, setEnvironment] = useState<'staging' | 'production' | 'local'>('staging');
  const [runSecurityScan, setRunSecurityScan] = useState(true);
  const [deployContainer, setDeployContainer] = useState(true);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTrigger(selectedPipelineId, {
      branch,
      environment,
      runSecurityScan,
      deployContainer,
      simulateFailure,
    });
    onClose();
  };

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-window" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 560 }}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div>
              <h3>Trigger Jenkins Pipeline Build</h3>
              {selectedPipeline && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Target: {selectedPipeline.name}
                </div>
              )}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Pipeline Selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Target Pipeline
            </label>
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                padding: '10px 14px',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>
                  {p.name} ({p.repository})
                </option>
              ))}
            </select>
          </div>

          {/* Branch Input */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Git Branch / Ref
            </label>
            <div style={{ position: 'relative' }}>
              <GitBranch size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main or feature/..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  padding: '10px 14px 10px 38px',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Environment */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Deployment Target
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {(['staging', 'production', 'local'] as const).map((env) => (
                <button
                  type="button"
                  key={env}
                  onClick={() => setEnvironment(env)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: environment === env ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: environment === env ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: environment === env ? '#a5b4fc' : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Checkboxes */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
            <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Pipeline Flags & Options
            </span>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: 'var(--text-main)', cursor: 'pointer', marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={runSecurityScan}
                onChange={(e) => setRunSecurityScan(e.target.checked)}
                style={{ accentColor: '#6366f1' }}
              />
              <Shield size={15} color="#fbbf24" />
              <span>Execute Trivy Security Vulnerability Scanner</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: 'var(--text-main)', cursor: 'pointer', marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={deployContainer}
                onChange={(e) => setDeployContainer(e.target.checked)}
                style={{ accentColor: '#6366f1' }}
              />
              <Boxes size={15} color="#38bdf8" />
              <span>Build Docker image & auto-deploy local container</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: '#f87171', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                style={{ accentColor: '#f43f5e' }}
              />
              <AlertCircle size={15} color="#f43f5e" />
              <span>Simulate Pipeline Failure (For College Viva Demonstration)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="btn-submit-trigger">
              <Play size={15} fill="currentColor" />
              <span>Launch Build</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
