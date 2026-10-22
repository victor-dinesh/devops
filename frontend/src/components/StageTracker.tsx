import React from 'react';
import { 
  GitBranch, 
  FileCheck2, 
  TestTube2, 
  ShieldCheck, 
  Boxes, 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  MinusCircle 
} from 'lucide-react';
import type { PipelineStage, StageStatus } from '../types/pipeline';

interface StageTrackerProps {
  stages: PipelineStage[];
}

export const StageTracker: React.FC<StageTrackerProps> = ({ stages }) => {
  const getStageIcon = (name: string, status: StageStatus) => {
    if (status === 'RUNNING') {
      return <Loader2 size={18} className="animate-spin" />;
    }
    if (status === 'SUCCESS') {
      return <CheckCircle2 size={18} />;
    }
    if (status === 'FAILED') {
      return <XCircle size={18} />;
    }
    if (status === 'SKIPPED') {
      return <MinusCircle size={18} />;
    }

    // Default pending stage icon based on type
    const lower = name.toLowerCase();
    if (lower.includes('checkout')) return <GitBranch size={16} />;
    if (lower.includes('lint')) return <FileCheck2 size={16} />;
    if (lower.includes('test')) return <TestTube2 size={16} />;
    if (lower.includes('security')) return <ShieldCheck size={16} />;
    if (lower.includes('docker')) return <Boxes size={16} />;
    if (lower.includes('deploy')) return <Rocket size={16} />;
    return <Clock size={16} />;
  };

  const getStatusClass = (status: StageStatus) => {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'RUNNING': return 'running';
      case 'FAILED': return 'failed';
      case 'SKIPPED': return 'skipped';
      default: return 'pending';
    }
  };

  return (
    <div className="stage-stepper-container">
      <div className="stage-stepper">
        <div className="stage-connector-line"></div>
        {stages.map((stage) => {
          const statusClass = getStatusClass(stage.status);
          return (
            <div 
              key={stage.id} 
              className={`stage-node ${statusClass}`}
              title={`${stage.name}: ${stage.status}${stage.durationSeconds ? ` (${stage.durationSeconds}s)` : ''}`}
            >
              <div className="stage-icon-circle">
                {getStageIcon(stage.name, stage.status)}
              </div>
              <span className="stage-name">{stage.name}</span>
              <span className="stage-duration">
                {stage.status === 'RUNNING' && 'Running...'}
                {stage.status === 'SUCCESS' && `${stage.durationSeconds ?? 0}s`}
                {stage.status === 'FAILED' && 'Failed'}
                {stage.status === 'SKIPPED' && 'Skipped'}
                {stage.status === 'PENDING' && 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
