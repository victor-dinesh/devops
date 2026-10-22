import React from 'react';
import { X, Boxes, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { DockerDeploymentInfo, Pipeline } from '../types/pipeline';

interface DockerStatusModalProps {
  pipeline: Pipeline;
  deployment: DockerDeploymentInfo;
  onClose: () => void;
}

export const DockerStatusModal: React.FC<DockerStatusModalProps> = ({
  pipeline,
  deployment,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-window" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 580 }}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Boxes size={20} color="#38bdf8" />
            <div>
              <h3>Docker Deployment Telemetry</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {pipeline.name} container status on local Docker host
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Main Status Card */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Container Instance
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 2 }}>
                {deployment.containerName}
              </div>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={13} />
              <span>{deployment.status.toUpperCase()}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Docker Image Tag</span>
              <code style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{deployment.imageTag}</code>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Host Port Mapping</span>
              <code style={{ fontSize: '0.85rem', color: '#38bdf8' }}>0.0.0.0:{deployment.port} ➜ {deployment.port}</code>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Uptime & Health</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{deployment.uptime}</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Resource Usage</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>CPU: 0.12% &bull; Mem: 44.8MB</span>
            </div>
          </div>

          {/* Direct Link Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a 
              href={`http://localhost:${deployment.port}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={15} />
              <span>Open Service (localhost:{deployment.port})</span>
            </a>
            <button className="btn-secondary" onClick={onClose}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
