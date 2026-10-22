import React from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Clock, 
  Terminal, 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  Boxes, 
  User, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from 'lucide-react';
import type { Pipeline, Build } from '../types/pipeline';
import { StageTracker } from './StageTracker';

interface PipelineCardProps {
  pipeline: Pipeline;
  onTrigger: (pipelineId: string) => void;
  onViewLogs: (pipeline: Pipeline, build: Build) => void;
  onViewSecurity: (pipeline: Pipeline, build: Build) => void;
  onViewDocker: (pipeline: Pipeline, build: Build) => void;
}

export const PipelineCard: React.FC<PipelineCardProps> = ({
  pipeline,
  onTrigger,
  onViewLogs,
  onViewSecurity,
  onViewDocker,
}) => {
  const lastBuild = pipeline.lastBuild;

  const renderStatusPill = () => {
    if (!lastBuild) {
      return <span className="status-pill">IDLE</span>;
    }
    switch (lastBuild.status) {
      case 'SUCCESS':
        return (
          <span className="status-pill success">
            <CheckCircle2 size={13} />
            <span>Passed</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="status-pill running">
            <Loader2 size={13} className="animate-spin" />
            <span>Building...</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="status-pill failed">
            <XCircle size={13} />
            <span>Failed</span>
          </span>
        );
      default:
        return <span className="status-pill">{lastBuild.status}</span>;
    }
  };

  const isRunning = lastBuild?.status === 'RUNNING';

  return (
    <div className={`pipeline-card ${isRunning ? 'running-glow' : ''}`}>
      {/* Top Header Row */}
      <div className="pipeline-card-top">
        <div>
          <div className="pipe-title-group">
            <h2 className="pipe-name">{pipeline.name}</h2>
            {renderStatusPill()}
            {lastBuild && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                #{lastBuild.buildNumber}
              </span>
            )}
          </div>
          <div className="pipe-meta-row">
            <div className="meta-item">
              <GitBranch size={14} color="#818cf8" />
              <span>{lastBuild?.branch || pipeline.defaultBranch}</span>
            </div>
            {lastBuild && (
              <>
                <div className="meta-item">
                  <GitCommit size={14} color="#94a3b8" />
                  <code>{lastBuild.commitHash}</code>
                </div>
                <div className="meta-item">
                  <span style={{ color: 'var(--text-secondary)' }}>"{lastBuild.commitMessage}"</span>
                </div>
                <div className="meta-item">
                  <User size={13} color="#94a3b8" />
                  <span>{lastBuild.author}</span>
                </div>
                <div className="meta-item">
                  <Clock size={13} color="#94a3b8" />
                  <span>{lastBuild.startedAt}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pipe-actions-group">
          {lastBuild && (
            <button 
              className="btn-secondary"
              onClick={() => onViewLogs(pipeline, lastBuild)}
              title="View Live Terminal Logs"
            >
              <Terminal size={14} color="#818cf8" />
              <span>Logs</span>
            </button>
          )}

          {lastBuild?.securitySummary && (
            <button 
              className="btn-secondary"
              onClick={() => onViewSecurity(pipeline, lastBuild)}
              title="View Security & Vulnerability Scan"
            >
              {lastBuild.securitySummary.critical + lastBuild.securitySummary.high > 0 ? (
                <ShieldAlert size={14} color="#fb923c" />
              ) : (
                <ShieldCheck size={14} color="#10b981" />
              )}
              <span>Security</span>
            </button>
          )}

          {lastBuild?.deployment && (
            <button 
              className="btn-secondary"
              onClick={() => onViewDocker(pipeline, lastBuild)}
              title="View Docker Deployment Details"
            >
              <Boxes size={14} color="#38bdf8" />
              <span>Docker</span>
            </button>
          )}

          <button 
            className="btn-primary"
            onClick={() => onTrigger(pipeline.id)}
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <Play size={13} fill="currentColor" />
            <span>Trigger</span>
          </button>
        </div>
      </div>

      {/* Embedded Visual Multi-Stage Progress */}
      {lastBuild ? (
        <StageTracker stages={lastBuild.stages} />
      ) : (
        <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          No builds executed yet for this pipeline.
        </div>
      )}
    </div>
  );
};
