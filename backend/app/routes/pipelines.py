"""
AutoPipeline DevOps - Pipeline Routes
Endpoints for listing pipelines, triggering builds, and querying build details.
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.config import settings
from app.models.schemas import (
    Pipeline, Build, TriggerRequest, TriggerResponse, PipelineStatus,
)
from app.services.mock_service import (
    get_demo_pipelines, trigger_demo_build, get_demo_build,
)

router = APIRouter(prefix="/api/pipelines", tags=["Pipelines"])


@router.get("", response_model=List[Pipeline], summary="List all pipelines")
async def list_pipelines():
    """
    Returns all configured CI/CD pipelines.
    In demo mode, returns mock data. In live mode, queries Jenkins.
    """
    if settings.is_demo_mode:
        return get_demo_pipelines()

    # Phase 3: real Jenkins integration
    # from app.services.jenkins_service import jenkins_service
    # return await jenkins_service.get_pipelines()
    return get_demo_pipelines()  # fallback


@router.post(
    "/{pipeline_id}/trigger",
    response_model=TriggerResponse,
    summary="Trigger a new pipeline build",
)
async def trigger_pipeline(pipeline_id: str, body: TriggerRequest):
    """
    Queue a new build for the specified pipeline.
    In demo mode, simulates a successful build instantly.
    """
    if settings.is_demo_mode:
        try:
            build = trigger_demo_build(pipeline_id, body.branch)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

        return TriggerResponse(
            message=f"Build #{build.build_number} queued successfully (Demo Mode).",
            pipeline_id=pipeline_id,
            build_number=build.build_number,
            status=build.status,
        )

    # Phase 3: real Jenkins trigger
    raise HTTPException(
        status_code=501,
        detail="Live Jenkins trigger not implemented yet. Set APP_MODE=demo.",
    )


@router.get(
    "/{pipeline_id}/builds/{build_number}",
    response_model=Build,
    summary="Get build details",
)
async def get_build(pipeline_id: str, build_number: int):
    """
    Return detailed information about a specific build including stages,
    logs, security summary, and deployment status.
    """
    if settings.is_demo_mode:
        build = get_demo_build(pipeline_id, build_number)
        if not build:
            raise HTTPException(
                status_code=404,
                detail=f"Build #{build_number} not found for pipeline '{pipeline_id}'.",
            )
        return build

    raise HTTPException(
        status_code=501,
        detail="Live Jenkins build lookup not implemented yet.",
    )
