export type StageStatus = 'SUCCESS' | 'RUNNING' | 'FAILED' | 'PENDING' | 'SKIPPED';

export type PipelineStatus = 'SUCCESS' | 'RUNNING' | 'FAILED' | 'QUEUED' | 'IDLE';

export interface PipelineStage {
  id: string;
  name: string;
  status: StageStatus;
  durationSeconds?: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

export interface SecurityVulnerability {
  id: string;
  cve: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  package: string;
  currentVersion: string;
  fixedIn: string;
  description: string;
  remediation: string;
}

export interface DockerDeploymentInfo {
  containerName: string;
  imageTag: string;
  port: number;
  status: 'running' | 'stopped' | 'restarting';
  uptime: string;
  health: 'healthy' | 'unhealthy' | 'starting';
}

export interface Build {
  buildNumber: number;
  status: PipelineStatus;
  trigger: 'Manual' | 'Git Push' | 'Webhook' | 'Scheduled';
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  startedAt: string;
  durationSeconds: number;
  stages: PipelineStage[];
  logs: string[];
  securitySummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: boolean;
    scannedAt: string;
    vulnerabilities: SecurityVulnerability[];
  };
  deployment?: DockerDeploymentInfo;
}

export interface Pipeline {
  id: string;
  name: string;
  repository: string;
  repoUrl: string;
  defaultBranch: string;
  description: string;
  lastBuild?: Build;
  history: Build[];
}

export interface PipelineMetrics {
  totalPipelines: number;
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  averageDurationSeconds: number;
  activeDeployments: number;
  securityHealthScore: number; // percentage
}
