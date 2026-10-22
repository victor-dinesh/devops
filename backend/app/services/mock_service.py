"""
AutoPipeline DevOps - Mock Data Service
Generates realistic demo data when Jenkins is not connected (APP_MODE=demo).
This mirrors the frontend demoData.ts so both sides show identical information.
"""

import random
from datetime import datetime
from typing import List

from app.models.schemas import (
    Pipeline, Build, PipelineStage, PipelineMetrics,
    SecuritySummary, SecurityVulnerability, DockerDeployment,
    StageStatus, PipelineStatus, TriggerType, Severity,
)


# ── Shared Demo Vulnerabilities ──────────────────────────

DEMO_VULNERABILITIES: List[SecurityVulnerability] = [
    SecurityVulnerability(
        id="VULN-001",
        cve="CVE-2024-21413",
        severity=Severity.HIGH,
        package="jsonwebtoken",
        current_version="8.5.1",
        fixed_in="9.0.2",
        description="Improper token validation can allow signature bypass in specific key rotations.",
        remediation="Upgrade jsonwebtoken to >= 9.0.2 in package.json",
    ),
    SecurityVulnerability(
        id="VULN-002",
        cve="CVE-2024-38875",
        severity=Severity.MEDIUM,
        package="axios",
        current_version="1.6.2",
        fixed_in="1.7.4",
        description="Server-side request forgery (SSRF) bypass when parsing certain protocol URLs.",
        remediation="Update axios to version 1.7.4 or later.",
    ),
    SecurityVulnerability(
        id="VULN-003",
        cve="CVE-2023-45133",
        severity=Severity.LOW,
        package="express",
        current_version="4.18.2",
        fixed_in="4.19.2",
        description="Denial of service potential with deeply nested query string objects.",
        remediation="Bump express to 4.19.2+ and configure qs depth limit.",
    ),
]


# ── Demo Pipelines ───────────────────────────────────────

def _build_initial_pipelines() -> List[Pipeline]:
    """Return a static base list of realistic demo pipelines."""
    return [
        Pipeline(
            id="pipe-ecommerce",
            name="ecommerce-microservice",
            repository="github.com/dinesh/ecommerce-service",
            repo_url="https://github.com/dinesh/ecommerce-service",
            default_branch="main",
            description="Core REST catalog and checkout service powered by Node.js & Docker.",
            last_build=Build(
                build_number=48,
                status=PipelineStatus.SUCCESS,
                trigger=TriggerType.GIT_PUSH,
                branch="main",
                commit_hash="9e4f21a",
                commit_message="feat: optimize checkout endpoint response latency",
                author="Dinesh (Lead DevOps)",
                started_at="12 mins ago",
                duration_seconds=53,
                stages=[
                    PipelineStage(id="stg-1", name="Checkout", status=StageStatus.SUCCESS, duration_seconds=4),
                    PipelineStage(id="stg-2", name="Lint & Format", status=StageStatus.SUCCESS, duration_seconds=6),
                    PipelineStage(id="stg-3", name="Unit Tests", status=StageStatus.SUCCESS, duration_seconds=12),
                    PipelineStage(id="stg-4", name="Security Scan", status=StageStatus.SUCCESS, duration_seconds=9),
                    PipelineStage(id="stg-5", name="Docker Build", status=StageStatus.SUCCESS, duration_seconds=14),
                    PipelineStage(id="stg-6", name="Deploy", status=StageStatus.SUCCESS, duration_seconds=8),
                ],
                logs=[
                    "[08:14:01] [INFO] AutoPipeline Jenkins Agent connected via JNLP.",
                    "[08:14:02] [CHECKOUT] Cloning repository from https://github.com/dinesh/ecommerce-service.git (branch: main)",
                    "[08:14:04] [CHECKOUT] Commit: 9e4f21a \"feat: optimize checkout endpoint response latency\"",
                    "[08:14:05] [LINT] Executing ESLint and Prettier style checks...",
                    "[08:14:09] [LINT] SUCCESS: 0 syntax errors, code style complies with project conventions.",
                    "[08:14:10] [TEST] Initiating automated unit test runner (Jest / Pytest)...",
                    "[08:14:14] [TEST] PASS: tests/auth.test.ts (14 assertions passed)",
                    "[08:14:18] [TEST] PASS: tests/checkout.test.ts (22 assertions passed)",
                    "[08:14:20] [TEST] SUCCESS: 36/36 unit tests passed in 9.4s (Coverage: 91.4%).",
                    "[08:14:21] [SECURITY] Starting container security scan via Trivy v0.51.0...",
                    "[08:14:26] [SECURITY] Vulnerability scan completed: 0 Critical, 0 High found. Gate passed.",
                    "[08:14:28] [DOCKER] Building image: autopipeline/ecommerce-service:b-48...",
                    "[08:14:48] [DOCKER] Successfully tagged autopipeline/ecommerce-service:b-48",
                    "[08:14:54] [DEPLOY] Health check HTTP GET http://localhost:3001/health returned 200 OK.",
                    "[08:14:55] [SUCCESS] Pipeline execution finished successfully in 53s.",
                ],
                security_summary=SecuritySummary(
                    critical=0, high=0, medium=1, low=1, passed=True,
                    scanned_at="12 mins ago",
                    vulnerabilities=[DEMO_VULNERABILITIES[1], DEMO_VULNERABILITIES[2]],
                ),
                deployment=DockerDeployment(
                    container_name="autopipeline-ecommerce-service",
                    image_tag="autopipeline/ecommerce-service:b-48",
                    port=3001, status="running",
                    uptime="Up 12 minutes (healthy)", health="healthy",
                ),
            ),
            history=[],
        ),
        Pipeline(
            id="pipe-auth",
            name="auth-identity-service",
            repository="github.com/dinesh/auth-identity-service",
            repo_url="https://github.com/dinesh/auth-identity-service",
            default_branch="main",
            description="OAuth2 and JWT authentication server with Redis token blacklist.",
            last_build=Build(
                build_number=29,
                status=PipelineStatus.RUNNING,
                trigger=TriggerType.MANUAL,
                branch="feature/jwt-rotation",
                commit_hash="3c81e9b",
                commit_message="fix: add grace period for token exchange validation",
                author="Dinesh (Lead DevOps)",
                started_at="Just now",
                duration_seconds=24,
                stages=[
                    PipelineStage(id="stg-1", name="Checkout", status=StageStatus.SUCCESS, duration_seconds=3),
                    PipelineStage(id="stg-2", name="Lint & Format", status=StageStatus.SUCCESS, duration_seconds=5),
                    PipelineStage(id="stg-3", name="Unit Tests", status=StageStatus.SUCCESS, duration_seconds=14),
                    PipelineStage(id="stg-4", name="Security Scan", status=StageStatus.RUNNING, duration_seconds=8),
                    PipelineStage(id="stg-5", name="Docker Build", status=StageStatus.PENDING),
                    PipelineStage(id="stg-6", name="Deploy", status=StageStatus.PENDING),
                ],
                logs=[
                    "[08:26:10] [INFO] Pipeline build #29 triggered manually by user dinesh.",
                    "[08:26:11] [CHECKOUT] Fetching branch feature/jwt-rotation (commit 3c81e9b)...",
                    "[08:26:14] [CHECKOUT] Workspace clean. Ready for compilation.",
                    "[08:26:15] [LINT] Running Flake8 and Black code linters...",
                    "[08:26:19] [LINT] SUCCESS: All 18 Python source files adhere to PEP 8 standards.",
                    "[08:26:20] [TEST] Running pytest tests/ --verbose...",
                    "[08:26:34] [TEST] SUCCESS: 12 passed in 14.12s.",
                    "[08:26:35] [SECURITY] Launching Trivy CVE scanner against python-deps...",
                    "[08:26:38] [SECURITY] [RUNNING] Scanning dependency graph for vulnerabilities...",
                ],
                security_summary=SecuritySummary(
                    critical=0, high=1, medium=0, low=0, passed=False,
                    scanned_at="In Progress",
                    vulnerabilities=[DEMO_VULNERABILITIES[0]],
                ),
            ),
            history=[],
        ),
        Pipeline(
            id="pipe-payment",
            name="payment-gateway-api",
            repository="github.com/dinesh/payment-gateway-api",
            repo_url="https://github.com/dinesh/payment-gateway-api",
            default_branch="main",
            description="Stripe and PayPal integration backend with HMAC webhook validation.",
            last_build=Build(
                build_number=17,
                status=PipelineStatus.FAILED,
                trigger=TriggerType.GIT_PUSH,
                branch="develop",
                commit_hash="a718c30",
                commit_message="refactor: enforce idempotency keys on card charges",
                author="Team Member",
                started_at="1 hour ago",
                duration_seconds=18,
                stages=[
                    PipelineStage(id="stg-1", name="Checkout", status=StageStatus.SUCCESS, duration_seconds=4),
                    PipelineStage(id="stg-2", name="Lint & Format", status=StageStatus.SUCCESS, duration_seconds=4),
                    PipelineStage(id="stg-3", name="Unit Tests", status=StageStatus.FAILED, duration_seconds=10, error="2 tests failed in test_webhook.py"),
                    PipelineStage(id="stg-4", name="Security Scan", status=StageStatus.SKIPPED),
                    PipelineStage(id="stg-5", name="Docker Build", status=StageStatus.SKIPPED),
                    PipelineStage(id="stg-6", name="Deploy", status=StageStatus.SKIPPED),
                ],
                logs=[
                    "[07:11:00] [INFO] Jenkins polling webhook detected commit a718c30 on branch develop.",
                    "[07:11:01] [CHECKOUT] git clone -b develop https://github.com/dinesh/payment-gateway-api",
                    "[07:11:04] [CHECKOUT] Successfully checked out commit a718c30.",
                    "[07:11:05] [LINT] Executing flake8 checks... Clean.",
                    "[07:11:09] [TEST] Running test suite: pytest tests/",
                    "[07:11:15] [TEST] FAIL: test_idempotency_duplicate_header (tests/test_webhook.py:42)",
                    "[07:11:16] [TEST] AssertionError: Expected HTTP 409 Conflict, received HTTP 500 Internal Error.",
                    "[07:11:17] [TEST] FAIL: test_signature_mismatch (tests/test_webhook.py:89)",
                    "[07:11:18] [ERROR] Stage Unit Tests failed with exit code 1.",
                    "[07:11:19] [PIPELINE] Subsequent stages [Security Scan, Docker Build, Deploy] aborted.",
                ],
                security_summary=SecuritySummary(
                    critical=0, high=0, medium=0, low=0, passed=False,
                    scanned_at="Skipped", vulnerabilities=[],
                ),
            ),
            history=[],
        ),
        Pipeline(
            id="pipe-notifications",
            name="notification-worker",
            repository="github.com/dinesh/notification-worker",
            repo_url="https://github.com/dinesh/notification-worker",
            default_branch="main",
            description="Background Celery worker consuming RabbitMQ queues for email & SMS delivery.",
            last_build=Build(
                build_number=34,
                status=PipelineStatus.SUCCESS,
                trigger=TriggerType.SCHEDULED,
                branch="main",
                commit_hash="b5e28cd",
                commit_message="chore(deps): update mailgun client SDK to 3.2.0",
                author="Jenkins Cron Scheduler",
                started_at="3 hours ago",
                duration_seconds=41,
                stages=[
                    PipelineStage(id="stg-1", name="Checkout", status=StageStatus.SUCCESS, duration_seconds=3),
                    PipelineStage(id="stg-2", name="Lint & Format", status=StageStatus.SUCCESS, duration_seconds=5),
                    PipelineStage(id="stg-3", name="Unit Tests", status=StageStatus.SUCCESS, duration_seconds=8),
                    PipelineStage(id="stg-4", name="Security Scan", status=StageStatus.SUCCESS, duration_seconds=7),
                    PipelineStage(id="stg-5", name="Docker Build", status=StageStatus.SUCCESS, duration_seconds=11),
                    PipelineStage(id="stg-6", name="Deploy", status=StageStatus.SUCCESS, duration_seconds=7),
                ],
                logs=[
                    "[05:00:00] [SCHEDULE] Nightly regression and container re-build initiated.",
                    "[05:00:03] [CHECKOUT] Pulled latest release tag v1.4.2 from main branch.",
                    "[05:00:08] [LINT] Lint completed without warnings.",
                    "[05:00:16] [TEST] All 28 worker tests passed.",
                    "[05:00:23] [SECURITY] Dependency audit passed with 0 known CVEs.",
                    "[05:00:34] [DOCKER] Image autopipeline/notification-worker:latest built & tagged.",
                    "[05:00:41] [DEPLOY] Restarted worker service. Healthy.",
                ],
                security_summary=SecuritySummary(
                    critical=0, high=0, medium=0, low=0, passed=True,
                    scanned_at="3 hours ago", vulnerabilities=[],
                ),
                deployment=DockerDeployment(
                    container_name="autopipeline-notification-worker",
                    image_tag="autopipeline/notification-worker:latest",
                    port=5050, status="running",
                    uptime="Up 3 hours (healthy)", health="healthy",
                ),
            ),
            history=[],
        ),
    ]


def get_demo_metrics() -> PipelineMetrics:
    """Return aggregate demo metrics."""
    return PipelineMetrics(
        total_pipelines=4,
        total_builds=128,
        successful_builds=112,
        failed_builds=16,
        average_duration_seconds=46,
        active_deployments=3,
        security_health_score=92,
    )


# ── In-memory state for triggered builds in demo mode ────

_triggered_builds: dict[str, Build] = {}


def trigger_demo_build(pipeline_id: str, branch: str) -> Build:
    """Simulate triggering a new build for a pipeline."""
    pipelines = get_demo_pipelines()
    pipe = next((p for p in pipelines if p.id == pipeline_id), None)
    if not pipe:
        raise ValueError(f"Pipeline '{pipeline_id}' not found in demo data.")

    next_num = (pipe.last_build.build_number + 1) if pipe.last_build else 1
    new_build = Build(
        build_number=next_num,
        status=PipelineStatus.SUCCESS,
        trigger=TriggerType.MANUAL,
        branch=branch,
        commit_hash=f"{random.randint(0x1000000, 0xFFFFFFF):07x}",
        commit_message=f"Build #{next_num} triggered via AutoPipeline Dashboard",
        author="Dinesh (DevOps Engineer)",
        started_at=datetime.now().strftime("%H:%M:%S"),
        duration_seconds=random.randint(30, 60),
        stages=[
            PipelineStage(id="stg-1", name="Checkout", status=StageStatus.SUCCESS, duration_seconds=3),
            PipelineStage(id="stg-2", name="Lint & Format", status=StageStatus.SUCCESS, duration_seconds=5),
            PipelineStage(id="stg-3", name="Unit Tests", status=StageStatus.SUCCESS, duration_seconds=11),
            PipelineStage(id="stg-4", name="Security Scan", status=StageStatus.SUCCESS, duration_seconds=8),
            PipelineStage(id="stg-5", name="Docker Build", status=StageStatus.SUCCESS, duration_seconds=12),
            PipelineStage(id="stg-6", name="Deploy", status=StageStatus.SUCCESS, duration_seconds=7),
        ],
        logs=[
            f"[{datetime.now().strftime('%H:%M:%S')}] [INFO] Build #{next_num} triggered manually.",
            f"[{datetime.now().strftime('%H:%M:%S')}] [CHECKOUT] Cloning branch {branch}...",
            f"[{datetime.now().strftime('%H:%M:%S')}] [LINT] Code quality checks passed.",
            f"[{datetime.now().strftime('%H:%M:%S')}] [TEST] All tests passed.",
            f"[{datetime.now().strftime('%H:%M:%S')}] [SECURITY] Trivy scan completed. No critical CVEs.",
            f"[{datetime.now().strftime('%H:%M:%S')}] [DOCKER] Image built and tagged.",
            f"[{datetime.now().strftime('%H:%M:%S')}] [DEPLOY] Container deployed. Health check passed.",
            f"[{datetime.now().strftime('%H:%M:%S')}] [SUCCESS] Pipeline completed successfully.",
        ],
        security_summary=SecuritySummary(
            critical=0, high=0, medium=0, low=0,
            passed=True, scanned_at=datetime.now().strftime("%H:%M:%S"),
            vulnerabilities=[],
        ),
        deployment=DockerDeployment(
            container_name=f"autopipeline-{pipe.name}",
            image_tag=f"autopipeline/{pipe.name}:b-{next_num}",
            port=3000 + random.randint(1, 99),
            status="running",
            uptime="Just deployed (healthy)",
            health="healthy",
        ),
    )

    _triggered_builds[pipeline_id] = new_build
    return new_build


def get_demo_build(pipeline_id: str, build_number: int) -> Build | None:
    """Retrieve a specific build (checks triggered cache first, then default data)."""
    # Check runtime triggered builds
    triggered = _triggered_builds.get(pipeline_id)
    if triggered and triggered.build_number == build_number:
        return triggered

    # Fall back to default demo data
    pipelines = get_demo_pipelines()
    pipe = next((p for p in pipelines if p.id == pipeline_id), None)
    if pipe and pipe.last_build and pipe.last_build.build_number == build_number:
        return pipe.last_build
    return None
