"""
AutoPipeline DevOps - Metrics Routes
Endpoints for build analytics and aggregate pipeline statistics.
"""

from fastapi import APIRouter

from app.config import settings
from app.models.schemas import PipelineMetrics
from app.services.mock_service import get_demo_metrics

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])


@router.get("", response_model=PipelineMetrics, summary="Get pipeline metrics")
async def get_metrics():
    """
    Return aggregate metrics across all pipelines:
    total builds, success rate, average duration, security health score.
    """
    if settings.is_demo_mode:
        return get_demo_metrics()

    # Phase 3: compute from real Jenkins data
    return get_demo_metrics()  # fallback
