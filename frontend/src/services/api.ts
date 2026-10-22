/**
 * AutoPipeline DevOps - API Client Service
 * Connects the React frontend to the FastAPI backend.
 * Falls back to local demo data when the backend is unreachable.
 */

import axios from 'axios';
import type { Pipeline, Build, PipelineMetrics } from '../types/pipeline';

// Backend base URL (FastAPI on port 8000)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Health Check ─────────────────────────────────────────

export interface HealthStatus {
  status: string;
  app_mode: string;
  jenkins_url: string;
  version: string;
  timestamp: string;
}

export async function checkBackendHealth(): Promise<HealthStatus | null> {
  try {
    const response = await api.get<HealthStatus>('/api/health');
    return response.data;
  } catch {
    return null;
  }
}

// ── Pipelines ────────────────────────────────────────────

export async function fetchPipelines(): Promise<Pipeline[]> {
  const response = await api.get<Pipeline[]>('/api/pipelines');
  // Transform snake_case from Python to camelCase for React
  return response.data.map(transformPipeline);
}

// ── Trigger Build ────────────────────────────────────────

export interface TriggerPayload {
  branch: string;
  environment: string;
  run_security_scan: boolean;
  deploy_container: boolean;
}

export interface TriggerResult {
  message: string;
  pipeline_id: string;
  build_number: number;
  status: string;
}

export async function triggerPipelineBuild(
  pipelineId: string,
  payload: TriggerPayload,
): Promise<TriggerResult> {
  const response = await api.post<TriggerResult>(
    `/api/pipelines/${pipelineId}/trigger`,
    payload,
  );
  return response.data;
}

// ── Build Details ────────────────────────────────────────

export async function fetchBuildDetails(
  pipelineId: string,
  buildNumber: number,
): Promise<Build> {
  const response = await api.get(`/api/pipelines/${pipelineId}/builds/${buildNumber}`);
  return transformBuild(response.data);
}

// ── Build Logs ───────────────────────────────────────────

export async function fetchBuildLogs(
  pipelineId: string,
  buildNumber: number,
): Promise<string[]> {
  const response = await api.get<string[]>(
    `/api/pipelines/${pipelineId}/builds/${buildNumber}/logs`,
  );
  return response.data;
}

// ── Metrics ──────────────────────────────────────────────

export async function fetchMetrics(): Promise<PipelineMetrics> {
  const response = await api.get('/api/metrics');
  return transformMetrics(response.data);
}

// ── Snake → Camel Transformers ───────────────────────────
// FastAPI returns snake_case keys; React expects camelCase.

/* eslint-disable @typescript-eslint/no-explicit-any */

function transformPipeline(raw: any): Pipeline {
  return {
    id: raw.id,
    name: raw.name,
    repository: raw.repository,
    repoUrl: raw.repo_url,
    defaultBranch: raw.default_branch,
    description: raw.description,
    lastBuild: raw.last_build ? transformBuild(raw.last_build) : undefined,
    history: (raw.history || []).map(transformBuild),
  };
}

function transformBuild(raw: any): Build {
  return {
    buildNumber: raw.build_number,
    status: raw.status,
    trigger: raw.trigger,
    branch: raw.branch,
    commitHash: raw.commit_hash,
    commitMessage: raw.commit_message,
    author: raw.author,
    startedAt: raw.started_at,
    durationSeconds: raw.duration_seconds,
    stages: (raw.stages || []).map(transformStage),
    logs: raw.logs || [],
    securitySummary: raw.security_summary
      ? {
          critical: raw.security_summary.critical,
          high: raw.security_summary.high,
          medium: raw.security_summary.medium,
          low: raw.security_summary.low,
          passed: raw.security_summary.passed,
          scannedAt: raw.security_summary.scanned_at,
          vulnerabilities: (raw.security_summary.vulnerabilities || []).map(transformVuln),
        }
      : {
          critical: 0, high: 0, medium: 0, low: 0,
          passed: true, scannedAt: 'N/A', vulnerabilities: [],
        },
    deployment: raw.deployment
      ? {
          containerName: raw.deployment.container_name,
          imageTag: raw.deployment.image_tag,
          port: raw.deployment.port,
          status: raw.deployment.status,
          uptime: raw.deployment.uptime,
          health: raw.deployment.health,
        }
      : undefined,
  };
}

function transformStage(raw: any) {
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    durationSeconds: raw.duration_seconds,
    startedAt: raw.started_at,
    finishedAt: raw.finished_at,
    error: raw.error,
  };
}

function transformVuln(raw: any) {
  return {
    id: raw.id,
    cve: raw.cve,
    severity: raw.severity,
    package: raw.package,
    currentVersion: raw.current_version,
    fixedIn: raw.fixed_in,
    description: raw.description,
    remediation: raw.remediation,
  };
}

function transformMetrics(raw: any): PipelineMetrics {
  return {
    totalPipelines: raw.total_pipelines,
    totalBuilds: raw.total_builds,
    successfulBuilds: raw.successful_builds,
    failedBuilds: raw.failed_builds,
    averageDurationSeconds: raw.average_duration_seconds,
    activeDeployments: raw.active_deployments,
    securityHealthScore: raw.security_health_score,
  };
}
