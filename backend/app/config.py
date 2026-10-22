"""
AutoPipeline DevOps - Backend Configuration
Reads settings from .env file or environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # Jenkins Connection (used in Phase 3)
    jenkins_url: str = "http://localhost:8080"
    jenkins_user: str = "admin"
    jenkins_api_token: str = "your-jenkins-api-token-here"

    # Server Settings
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Mode: "demo" uses mock data, "live" connects to real Jenkins
    app_mode: str = "demo"

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_demo_mode(self) -> bool:
        return self.app_mode.lower() == "demo"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


# Singleton settings instance
settings = Settings()
