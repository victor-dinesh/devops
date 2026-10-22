import React from 'react';
import { Layers, CheckCircle2, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
import type { PipelineMetrics } from '../types/pipeline';

interface MetricsOverviewProps {
  metrics: PipelineMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const successPercentage = Math.round(
    (metrics.successfulBuilds / (metrics.totalBuilds || 1)) * 100
  );

  return (
    <section className="metrics-grid" aria-label="Pipeline Telemetry Metrics">
      {/* Total Builds */}
      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">Total Builds Executed</span>
          <span className="metric-value">{metrics.totalBuilds}</span>
          <div className="metric-subtext">
            <TrendingUp size={13} />
            <span>Across {metrics.totalPipelines} configured pipelines</span>
          </div>
        </div>
        <div className="metric-icon-box" style={{ color: '#818cf8' }}>
          <Layers size={22} />
        </div>
      </div>

      {/* Success Rate */}
      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">Pipeline Success Rate</span>
          <span className="metric-value">{successPercentage}%</span>
          <div className="metric-subtext" style={{ color: '#10b981' }}>
            <CheckCircle2 size={13} />
            <span>{metrics.successfulBuilds} passed / {metrics.failedBuilds} failed</span>
          </div>
        </div>
        <div className="metric-icon-box" style={{ color: '#10b981' }}>
          <CheckCircle2 size={22} />
        </div>
      </div>

      {/* Average Duration */}
      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">Average Pipeline Time</span>
          <span className="metric-value">{metrics.averageDurationSeconds}s</span>
          <div className="metric-subtext" style={{ color: '#06b6d4' }}>
            <Clock size={13} />
            <span>Multi-stage build & test cycle</span>
          </div>
        </div>
        <div className="metric-icon-box" style={{ color: '#06b6d4' }}>
          <Clock size={22} />
        </div>
      </div>

      {/* Security Health */}
      <div className="metric-card">
        <div className="metric-info">
          <span className="metric-label">Security Health Score</span>
          <span className="metric-value">{metrics.securityHealthScore}%</span>
          <div className="metric-subtext" style={{ color: '#a855f7' }}>
            <ShieldCheck size={13} />
            <span>Trivy & SAST vulnerability audit</span>
          </div>
        </div>
        <div className="metric-icon-box" style={{ color: '#a855f7' }}>
          <ShieldCheck size={22} />
        </div>
      </div>
    </section>
  );
};
