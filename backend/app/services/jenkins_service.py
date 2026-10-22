"""
AutoPipeline DevOps - Jenkins API Service (Phase 3 Placeholder)
Will integrate with real Jenkins REST API when Jenkins is running.
For now, raises NotImplementedError — the routes fall back to mock_service.
"""

import httpx
from app.config import settings


class JenkinsService:
    """Wrapper around Jenkins REST API. Activated when APP_MODE=live."""

    def __init__(self):
        self.base_url = settings.jenkins_url
        self.auth = (settings.jenkins_user, settings.jenkins_api_token)

    async def is_reachable(self) -> bool:
        """Check if Jenkins is reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(
                    f"{self.base_url}/api/json",
                    auth=self.auth,
                )
                return resp.status_code == 200
        except (httpx.ConnectError, httpx.TimeoutException):
            return False

    # ── Placeholder methods (will be fully implemented in Phase 3) ──

    async def get_pipelines(self):
        raise NotImplementedError("Jenkins integration is planned for Phase 3.")

    async def trigger_build(self, job_name: str, branch: str = "main"):
        raise NotImplementedError("Jenkins integration is planned for Phase 3.")

    async def get_build_info(self, job_name: str, build_number: int):
        raise NotImplementedError("Jenkins integration is planned for Phase 3.")

    async def get_build_logs(self, job_name: str, build_number: int) -> str:
        raise NotImplementedError("Jenkins integration is planned for Phase 3.")


# Singleton
jenkins_service = JenkinsService()
