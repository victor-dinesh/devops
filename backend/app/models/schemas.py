"""
AutoPipeline DevOps - Pydantic Data Schemas
Defines all request/response models used by the API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


# ── Enums ──────────────────────────────────────────────────

class StageStatus(str, Enum):
    SUCCESS = "SUCCESS"
    RUNNING = "RUNNING"
    FAILED = "FAILED"
    PENDING = "PENDING"
    SKIPPED = "SKIPPED"


class PipelineStatus(str, Enum):
    SUCCESS = "SUCCESS"
    RUNNING = "RUNNING"
    FAILED = "FAILED"
    QUEUED = "QUEUED"
    IDLE = "IDLE"


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class TriggerType(str, Enum):
    MANUAL = "Manual"
    GIT_PUSH = "Git Push"
    WEBHOOK = "Webhook"
    SCHEDULED = "Scheduled"


# ── Sub-models ─────────────────────────────────────────────

class PipelineStage(BaseModel):
    id: str
    name: str
    status: StageStatus
    duration_seconds: Optional[float] = None
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    error: Optional[str] = None


class SecurityVulnerability(BaseModel):
    id: str
    cve: str
    severity: Severity
    package: str
    current_version: str
    fixed_in: str
    description: str
    remediation: str


class SecuritySummary(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    passed: bool = True
    scanned_at: str = "N/A"
    vulnerabilities: List[SecurityVulnerability] = []


class DockerDeployment(BaseModel):
    container_name: str
    image_tag: str
    port: int
    status: str  # "running" | "stopped" | "restarting"
    uptime: str
    health: str  # "healthy" | "unhealthy" | "starting"


# ── Core Models ────────────────────────────────────────────

class Build(BaseModel):
    build_number: int
    status: PipelineStatus
    trigger: TriggerType
    branch: str
    commit_hash: str
    commit_message: str
    author: str
    started_at: str
    duration_seconds: float
    stages: List[PipelineStage]
    logs: List[str] = []
    security_summary: Optional[SecuritySummary] = None
    deployment: Optional[DockerDeployment] = None


class Pipeline(BaseModel):
    id: str
    name: str
    repository: str
    repo_url: str
    default_branch: str
    description: str
    last_build: Optional[Build] = None
    history: List[Build] = []


class PipelineMetrics(BaseModel):
    total_pipelines: int
    total_builds: int
    successful_builds: int
    failed_builds: int
    average_duration_seconds: float
    active_deployments: int
    security_health_score: float


# ── Request / Response Models ──────────────────────────────

class TriggerRequest(BaseModel):
    """Request body when triggering a pipeline build."""
    branch: str = "main"
    environment: str = "staging"
    run_security_scan: bool = True
    deploy_container: bool = True


class TriggerResponse(BaseModel):
    """Response after successfully queuing a pipeline build."""
    message: str
    pipeline_id: str
    build_number: int
    status: PipelineStatus


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    app_mode: str
    jenkins_url: str
    version: str = "1.0.0"
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
