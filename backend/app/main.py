"""
AutoPipeline DevOps - FastAPI Application Entrypoint
Central app setup: CORS, route registration, health check, and error handling.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.models.schemas import HealthResponse
from app.routes import pipelines, logs, metrics

# ── Logging ────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("autopipeline")


# ── Lifespan (startup / shutdown) ──────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("  AutoPipeline DevOps Backend Starting")
    logger.info(f"  Mode       : {'DEMO (Mock Data)' if settings.is_demo_mode else 'LIVE (Jenkins)'}")
    logger.info(f"  Jenkins URL: {settings.jenkins_url}")
    logger.info(f"  CORS Allow : {settings.cors_origin_list}")
    logger.info("=" * 60)
    yield
    logger.info("AutoPipeline DevOps Backend shutting down.")


# ── FastAPI Application ───────────────────────────────────

app = FastAPI(
    title="AutoPipeline DevOps API",
    description=(
        "REST API backend for the AutoPipeline CI/CD Dashboard. "
        "Bridges the React frontend to Jenkins, Docker, and security scanning tools."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ── CORS Middleware ────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ──────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred.",
            "error": str(exc),
        },
    )


# ── Health Check ──────────────────────────────────────────

@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check endpoint",
)
async def health_check():
    """
    Returns the current health status of the backend,
    including the active mode (demo vs live) and Jenkins URL.
    """
    return HealthResponse(
        status="healthy",
        app_mode=settings.app_mode,
        jenkins_url=settings.jenkins_url,
    )


# ── Register Route Modules ───────────────────────────────

app.include_router(pipelines.router)
app.include_router(logs.router)
app.include_router(metrics.router)


# ── Root Redirect ─────────────────────────────────────────

@app.get("/", tags=["System"], include_in_schema=False)
async def root():
    return {
        "service": "AutoPipeline DevOps API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
