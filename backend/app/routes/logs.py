"""
AutoPipeline DevOps - Logs Routes
Endpoints for retrieving console output from pipeline builds.
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.config import settings
from app.services.mock_service import get_demo_build

router = APIRouter(prefix="/api/pipelines", tags=["Logs"])


@router.get(
    "/{pipeline_id}/builds/{build_number}/logs",
    response_model=List[str],
    summary="Get build console logs",
)
async def get_build_logs(pipeline_id: str, build_number: int):
    """
    Return the console output log lines for a specific build.
    In demo mode, returns the mock log array.
    In live mode (Phase 3), will stream progressive console text from Jenkins.
    """
    if settings.is_demo_mode:
        build = get_demo_build(pipeline_id, build_number)
        if not build:
            raise HTTPException(
                status_code=404,
                detail=f"Build #{build_number} not found for pipeline '{pipeline_id}'.",
            )
        return build.logs

    # Phase 3: real Jenkins log streaming
    raise HTTPException(
        status_code=501,
        detail="Live Jenkins log streaming not implemented yet.",
    )
