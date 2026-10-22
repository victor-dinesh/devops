import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { PipelineCard } from './components/PipelineCard';
import { LiveLogsModal } from './components/LiveLogsModal';
import { SecurityScanModal } from './components/SecurityScanModal';
import { DockerStatusModal } from './components/DockerStatusModal';
import { TriggerBuildModal } from './components/TriggerBuildModal';
import type { TriggerOptions } from './components/TriggerBuildModal';
import { INITIAL_PIPELINES, DEMO_METRICS } from './mock/demoData';
import type { Pipeline, Build, PipelineMetrics, StageStatus } from './types/pipeline';
import {
  checkBackendHealth,
  fetchPipelines,
  fetchMetrics,
  triggerPipelineBuild,
} from './services/api';

export const App: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>(INITIAL_PIPELINES);
  const [metrics, setMetrics] = useState<PipelineMetrics>(DEMO_METRICS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [backendNotice, setBackendNotice] = useState<string | null>(null);

  // Active Modal Selection IDs
  const [selectedPipelineForTrigger, setSelectedPipelineForTrigger] = useState<string | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState<boolean>(false);
  const [activeLogsSelection, setActiveLogsSelection] = useState<{ pipelineId: string; buildNumber: number } | null>(null);
  const [activeSecuritySelection, setActiveSecuritySelection] = useState<{ pipelineId: string; buildNumber: number } | null>(null);
  const [activeDockerSelection, setActiveDockerSelection] = useState<{ pipelineId: string; buildNumber: number } | null>(null);

  // Derive active modal data reactively from current pipelines state without cascading setState effects
  const activeLogsPipeline = activeLogsSelection
    ? pipelines.find((p) => p.id === activeLogsSelection.pipelineId) || null
    : null;
  const activeLogsBuild: Build | null = activeLogsPipeline
    ? (activeLogsPipeline.lastBuild?.buildNumber === activeLogsSelection?.buildNumber
        ? (activeLogsPipeline.lastBuild ?? null)
        : (activeLogsPipeline.history.find((b) => b.buildNumber === activeLogsSelection?.buildNumber) ??
           activeLogsPipeline.lastBuild ?? null))
    : null;

  const activeSecurityPipeline = activeSecuritySelection
    ? pipelines.find((p) => p.id === activeSecuritySelection.pipelineId) || null
    : null;
  const activeSecurityBuild: Build | null = activeSecurityPipeline
    ? (activeSecurityPipeline.lastBuild?.buildNumber === activeSecuritySelection?.buildNumber
        ? (activeSecurityPipeline.lastBuild ?? null)
        : (activeSecurityPipeline.history.find((b) => b.buildNumber === activeSecuritySelection?.buildNumber) ??
           activeSecurityPipeline.lastBuild ?? null))
    : null;

  const activeDockerPipeline = activeDockerSelection
    ? pipelines.find((p) => p.id === activeDockerSelection.pipelineId) || null
    : null;
  const activeDockerBuild: Build | null = activeDockerPipeline
    ? (activeDockerPipeline.lastBuild?.buildNumber === activeDockerSelection?.buildNumber
        ? (activeDockerPipeline.lastBuild ?? null)
        : (activeDockerPipeline.history.find((b) => b.buildNumber === activeDockerSelection?.buildNumber) ??
           activeDockerPipeline.lastBuild ?? null))
    : null;

  // Poll backend health check
  const refreshBackendStatus = useCallback(async () => {
    const health = await checkBackendHealth();
    const isUp = !!health && health.status === 'healthy';
    setBackendOnline(isUp);
    return isUp;
  }, []);

  // Load data from live FastAPI backend
  const loadBackendData = useCallback(async () => {
    try {
      const [backendPipes, backendMetrics] = await Promise.all([
        fetchPipelines(),
        fetchMetrics(),
      ]);
      setPipelines(backendPipes);
      setMetrics(backendMetrics);
      setBackendNotice('Connected to live FastAPI backend at port 8000.');
    } catch {
      setBackendNotice('Failed to fetch from FastAPI. Falling back to local data.');
    }
  }, []);

  // Health check on initial render
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((health) => {
      if (isMounted) {
        setBackendOnline(!!health && health.status === 'healthy');
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle switching modes
  const handleToggleMode = async () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);

    if (!nextMode) {
      // Switching to Live API Mode
      const isUp = await refreshBackendStatus();
      if (isUp) {
        await loadBackendData();
      } else {
        setBackendNotice('FastAPI backend not detected at http://localhost:8000. Running in fallback mode.');
      }
    } else {
      // Reset back to initial demo data
      setPipelines(INITIAL_PIPELINES);
      setMetrics(DEMO_METRICS);
      setBackendNotice(null);
    }
  };

  // Handler to open trigger modal
  const handleOpenTrigger = (pipelineId?: string) => {
    setSelectedPipelineForTrigger(pipelineId || null);
    setIsTriggerModalOpen(true);
  };

  // Build trigger handler
  const handleTriggerPipeline = async (pipelineId: string, options: TriggerOptions) => {
    // If connected in Live API mode, send real trigger request to FastAPI
    if (!isDemoMode && backendOnline) {
      try {
        await triggerPipelineBuild(pipelineId, {
          branch: options.branch,
          environment: options.environment,
          run_security_scan: options.runSecurityScan,
          deploy_container: options.deployContainer,
        });
        await loadBackendData();
        return;
      } catch (err) {
        console.error('Failed to trigger build on backend, falling back to simulation', err);
      }
    }

    // Interactive Demo Mode: live in-browser multi-stage simulation
    setPipelines((prevPipelines) => {
      return prevPipelines.map((pipe) => {
        if (pipe.id !== pipelineId) return pipe;

        const nextBuildNumber = (pipe.lastBuild?.buildNumber || 0) + 1;
        const newBuild: Build = {
          buildNumber: nextBuildNumber,
          status: 'RUNNING',
          trigger: 'Manual',
          branch: options.branch,
          commitHash: Math.random().toString(36).substring(2, 9),
          commitMessage: `Trigger build #${nextBuildNumber} via AutoPipeline Web Dashboard`,
          author: 'Dinesh (DevOps Engineer)',
          startedAt: 'Just now',
          durationSeconds: 0,
          stages: [
            { id: 'stg-1', name: 'Checkout', status: 'RUNNING' },
            { id: 'stg-2', name: 'Lint & Format', status: 'PENDING' },
            { id: 'stg-3', name: 'Unit Tests', status: 'PENDING' },
            { id: 'stg-4', name: 'Security Scan', status: 'PENDING' },
            { id: 'stg-5', name: 'Docker Build', status: 'PENDING' },
            { id: 'stg-6', name: 'Deploy', status: 'PENDING' },
          ],
          logs: [
            `[${new Date().toLocaleTimeString()}] [INFO] AutoPipeline Jenkins Runner assigned agent executor-1.`,
            `[${new Date().toLocaleTimeString()}] [INFO] Build #${nextBuildNumber} initialized for repository ${pipe.name}.`,
            `[${new Date().toLocaleTimeString()}] [CHECKOUT] Fetching git ref origin/${options.branch}...`,
          ],
          securitySummary: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            passed: true,
            scannedAt: 'Pending',
            vulnerabilities: [],
          },
        };

        return {
          ...pipe,
          lastBuild: newBuild,
        };
      });
    });

    runPipelineSimulation(pipelineId, options);
  };

  const runPipelineSimulation = (pipelineId: string, options: TriggerOptions) => {
    const stageSequence = [
      {
        stageIndex: 0,
        name: 'Checkout',
        duration: 2,
        logLines: [
          `[CHECKOUT] Checked out branch ${options.branch} successfully.`,
          `[CHECKOUT] Local workspace verified and clean.`,
        ],
      },
      {
        stageIndex: 1,
        name: 'Lint & Format',
        duration: 2,
        logLines: [
          `[LINT] Running code syntax linter (ESLint / Flake8)...`,
          `[LINT] Code style standards verified: 0 errors detected.`,
        ],
      },
      {
        stageIndex: 2,
        name: 'Unit Tests',
        duration: 3,
        logLines: options.simulateFailure
          ? [
              `[TEST] Running automated test suite...`,
              `[TEST] FAIL: test_order_creation (tests/order.test.ts:32)`,
              `[ERROR] AssertionError: Expected 201 Created but got 500 Internal Error.`,
              `[ERROR] Stage 'Unit Tests' exited with failure code 1.`,
            ]
          : [
              `[TEST] Running automated unit tests...`,
              `[TEST] PASS: 24 tests passed across 4 test suites. Coverage: 92.8%`,
            ],
      },
      {
        stageIndex: 3,
        name: 'Security Scan',
        duration: 2,
        logLines: [
          `[SECURITY] Invoking Trivy Container & Dependency Scanner...`,
          `[SECURITY] Audit complete: 0 Critical vulnerabilities found. Gate passed.`,
        ],
      },
      {
        stageIndex: 4,
        name: 'Docker Build',
        duration: 3,
        logLines: [
          `[DOCKER] Sending build context to Docker daemon...`,
          `[DOCKER] Step 1/4 : FROM node:20-alpine`,
          `[DOCKER] Step 2/4 : COPY . .`,
          `[DOCKER] Step 3/4 : RUN npm ci --omit=dev`,
          `[DOCKER] Successfully built and tagged container image.`,
        ],
      },
      {
        stageIndex: 5,
        name: 'Deploy',
        duration: 2,
        logLines: [
          `[DEPLOY] Target environment: ${options.environment.toUpperCase()}`,
          `[DEPLOY] Starting container instance on local Docker daemon...`,
          `[DEPLOY] Container health probe returned HTTP 200 OK. Deployed!`,
          `[SUCCESS] CI/CD Pipeline successfully executed!`,
        ],
      },
    ];

    let currentStep = 0;

    const executeNextStage = () => {
      if (currentStep >= stageSequence.length) {
        // Mark pipeline overall as SUCCESS
        setPipelines((prev) =>
          prev.map((pipe) => {
            if (pipe.id !== pipelineId || !pipe.lastBuild) return pipe;
            return {
              ...pipe,
              lastBuild: {
                ...pipe.lastBuild,
                status: 'SUCCESS',
                durationSeconds: 14,
                deployment: {
                  containerName: `autopipeline-${pipe.name}`,
                  imageTag: `autopipeline/${pipe.name}:b-${pipe.lastBuild.buildNumber}`,
                  port: 3000 + Math.floor(Math.random() * 50),
                  status: 'running',
                  uptime: 'Just deployed (healthy)',
                  health: 'healthy',
                },
              },
            };
          })
        );
        setMetrics((prev) => ({
          ...prev,
          totalBuilds: prev.totalBuilds + 1,
          successfulBuilds: prev.successfulBuilds + 1,
        }));
        return;
      }

      const stepConfig = stageSequence[currentStep];

      // If user requested simulated failure at unit test stage
      if (options.simulateFailure && currentStep === 2) {
        setPipelines((prev) =>
          prev.map((pipe) => {
            if (pipe.id !== pipelineId || !pipe.lastBuild) return pipe;
            const updatedStages = pipe.lastBuild.stages.map((stg, idx) => {
              if (idx === currentStep) {
                return { ...stg, status: 'FAILED' as StageStatus, durationSeconds: stepConfig.duration };
              }
              if (idx > currentStep) {
                return { ...stg, status: 'SKIPPED' as StageStatus };
              }
              return stg;
            });

            return {
              ...pipe,
              lastBuild: {
                ...pipe.lastBuild,
                status: 'FAILED',
                durationSeconds: 7,
                stages: updatedStages,
                logs: [...pipe.lastBuild.logs, ...stepConfig.logLines],
              },
            };
          })
        );
        setMetrics((prev) => ({
          ...prev,
          totalBuilds: prev.totalBuilds + 1,
          failedBuilds: prev.failedBuilds + 1,
        }));
        return;
      }

      // Progress regular stage to SUCCESS and activate next stage
      setPipelines((prev) =>
        prev.map((pipe) => {
          if (pipe.id !== pipelineId || !pipe.lastBuild) return pipe;
          const updatedStages = pipe.lastBuild.stages.map((stg, idx) => {
            if (idx === currentStep) {
              return { ...stg, status: 'SUCCESS' as StageStatus, durationSeconds: stepConfig.duration };
            }
            if (idx === currentStep + 1) {
              return { ...stg, status: 'RUNNING' as StageStatus };
            }
            return stg;
          });

          return {
            ...pipe,
            lastBuild: {
              ...pipe.lastBuild,
              stages: updatedStages,
              logs: [...pipe.lastBuild.logs, ...stepConfig.logLines],
            },
          };
        })
      );

      currentStep++;
      setTimeout(executeNextStage, 1400);
    };

    setTimeout(executeNextStage, 1400);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleMode}
        onOpenTriggerModal={() => handleOpenTrigger()}
        buildsCount={metrics.totalBuilds}
        apiConnected={backendOnline}
      />

      {/* Demo / Live Status Banner */}
      {isDemoMode ? (
        <div className="demo-banner">
          <div className="demo-banner-left">
            <span className="demo-badge-pill">Interactive Demo Mode</span>
            <div className="demo-banner-text">
              Simulating multi-stage CI/CD execution with real-time logs, security scanning, and Docker deployments.
              <span> Click "Run Pipeline" to test live stages or simulate test failures.</span>
            </div>
          </div>
          <button 
            className="demo-mode-toggle"
            onClick={handleToggleMode}
            title="Switch connection to live FastAPI backend"
          >
            <span>{backendOnline ? 'Switch to Live FastAPI' : 'FastAPI Offline - Click to Test'}</span>
          </button>
        </div>
      ) : (
        <div className="demo-banner" style={{ borderLeftColor: backendOnline ? '#10b981' : '#f59e0b' }}>
          <div className="demo-banner-left">
            <span 
              className="demo-badge-pill" 
              style={{ backgroundColor: backendOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: backendOnline ? '#34d399' : '#fbbf24' }}
            >
              {backendOnline ? 'Live API Mode Active' : 'Connecting to Backend'}
            </span>
            <div className="demo-banner-text">
              {backendNotice || (backendOnline ? 'Connected to FastAPI backend on port 8000.' : 'Attempting to reach FastAPI backend on port 8000...')}
            </div>
          </div>
          <button 
            className="demo-mode-toggle"
            onClick={handleToggleMode}
            title="Switch back to Demo Sandbox"
          >
            <span>Return to Demo Sandbox</span>
          </button>
        </div>
      )}

      {/* Overview Metrics Cards */}
      <MetricsOverview metrics={metrics} />

      {/* Pipelines List Section */}
      <main>
        <div className="section-header">
          <div className="section-title">
            <span>Automated CI/CD Pipelines</span>
            <span className="section-count-badge">{pipelines.length} Active</span>
          </div>
        </div>

        <div className="pipelines-list">
          {pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onTrigger={(id) => handleOpenTrigger(id)}
              onViewLogs={(pipe, bld) => setActiveLogsSelection({ pipelineId: pipe.id, buildNumber: bld.buildNumber })}
              onViewSecurity={(pipe, bld) => setActiveSecuritySelection({ pipelineId: pipe.id, buildNumber: bld.buildNumber })}
              onViewDocker={(pipe, bld) => setActiveDockerSelection({ pipelineId: pipe.id, buildNumber: bld.buildNumber })}
            />
          ))}
        </div>
      </main>

      {/* Interactive Modals */}
      {isTriggerModalOpen && (
        <TriggerBuildModal
          pipelines={pipelines}
          initialPipelineId={selectedPipelineForTrigger || undefined}
          onClose={() => setIsTriggerModalOpen(false)}
          onTrigger={handleTriggerPipeline}
        />
      )}

      {activeLogsPipeline && activeLogsBuild && (
        <LiveLogsModal
          pipeline={activeLogsPipeline}
          build={activeLogsBuild}
          onClose={() => setActiveLogsSelection(null)}
        />
      )}

      {activeSecurityPipeline && activeSecurityBuild && (
        <SecurityScanModal
          pipeline={activeSecurityPipeline}
          build={activeSecurityBuild}
          onClose={() => setActiveSecuritySelection(null)}
        />
      )}

      {activeDockerPipeline && activeDockerBuild && activeDockerBuild.deployment && (
        <DockerStatusModal
          pipeline={activeDockerPipeline}
          deployment={activeDockerBuild.deployment}
          onClose={() => setActiveDockerSelection(null)}
        />
      )}
    </div>
  );
};

export default App;
