"""
AutoPipeline DevOps - Backend API Test Suite
Automated tests for FastAPI endpoints: health, pipelines, builds, logs, and metrics.
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.mock_service import reset_demo_data


class TestAutoPipelineAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        reset_demo_data()

    def test_root_endpoint(self):
        """Test root info endpoint returns 200 and docs/health URLs."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("service"), "AutoPipeline DevOps API")
        self.assertIn("docs", data)
        self.assertIn("health", data)

    def test_health_check(self):
        """Test /api/health endpoint returns healthy status and metadata."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertEqual(data.get("app_mode"), "demo")
        self.assertIn("jenkins_url", data)
        self.assertIn("version", data)

    def test_list_pipelines(self):
        """Test /api/pipelines returns all configured demo pipelines."""
        response = self.client.get("/api/pipelines")
        self.assertEqual(response.status_code, 200)
        pipelines = response.json()
        self.assertIsInstance(pipelines, list)
        self.assertGreaterEqual(len(pipelines), 4)

        pipe_ids = [p["id"] for p in pipelines]
        self.assertIn("pipe-ecommerce", pipe_ids)
        self.assertIn("pipe-auth", pipe_ids)
        self.assertIn("pipe-payment", pipe_ids)
        self.assertIn("pipe-notifications", pipe_ids)

        # Validate pipeline structure
        first = pipelines[0]
        self.assertIn("name", first)
        self.assertIn("repository", first)
        self.assertIn("last_build", first)
        self.assertIn("stages", first["last_build"])

    def test_trigger_pipeline_success(self):
        """Test triggering a new build for an existing pipeline."""
        payload = {
            "branch": "feature/testing-automation",
            "environment": "staging",
            "run_security_scan": True,
            "deploy_container": True,
        }
        response = self.client.post("/api/pipelines/pipe-ecommerce/trigger", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertEqual(data.get("pipeline_id"), "pipe-ecommerce")
        self.assertGreaterEqual(data.get("build_number"), 49)
        self.assertEqual(data.get("status"), "SUCCESS")

        # Verify build is retrievable via build details endpoint
        build_num = data["build_number"]
        build_resp = self.client.get(f"/api/pipelines/pipe-ecommerce/builds/{build_num}")
        self.assertEqual(build_resp.status_code, 200)
        build_data = build_resp.json()
        self.assertEqual(build_data["build_number"], build_num)
        self.assertEqual(build_data["branch"], "feature/testing-automation")
        self.assertGreater(len(build_data["stages"]), 0)
        self.assertIsNotNone(build_data["deployment"])

    def test_trigger_pipeline_not_found(self):
        """Test triggering a non-existent pipeline returns 404."""
        payload = {"branch": "main"}
        response = self.client.post("/api/pipelines/non-existent-pipeline/trigger", json=payload)
        self.assertEqual(response.status_code, 404)

    def test_get_build_details_and_logs(self):
        """Test fetching existing build details and build console logs."""
        # pipe-ecommerce default last build is #48
        response = self.client.get("/api/pipelines/pipe-ecommerce/builds/48")
        self.assertEqual(response.status_code, 200)
        build = response.json()
        self.assertEqual(build["build_number"], 48)
        self.assertEqual(build["status"], "SUCCESS")
        self.assertIn("security_summary", build)
        self.assertIn("deployment", build)

        # Test log retrieval
        log_resp = self.client.get("/api/pipelines/pipe-ecommerce/builds/48/logs")
        self.assertEqual(log_resp.status_code, 200)
        logs = log_resp.json()
        self.assertIsInstance(logs, list)
        self.assertGreater(len(logs), 0)
        self.assertTrue(any("AutoPipeline Jenkins Agent" in line for line in logs))

    def test_get_build_not_found(self):
        """Test fetching a non-existent build number returns 404."""
        response = self.client.get("/api/pipelines/pipe-ecommerce/builds/99999")
        self.assertEqual(response.status_code, 404)

    def test_get_logs_not_found(self):
        """Test fetching logs for non-existent build returns 404."""
        response = self.client.get("/api/pipelines/pipe-ecommerce/builds/99999/logs")
        self.assertEqual(response.status_code, 404)

    def test_get_metrics(self):
        """Test /api/metrics returns aggregate build metrics."""
        response = self.client.get("/api/metrics")
        self.assertEqual(response.status_code, 200)
        metrics = response.json()
        self.assertGreaterEqual(metrics["total_pipelines"], 4)
        self.assertGreater(metrics["total_builds"], 0)
        self.assertGreater(metrics["successful_builds"], 0)
        self.assertGreater(metrics["security_health_score"], 0)


if __name__ == "__main__":
    unittest.main()
