import React, { useState, useEffect } from 'react';
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

export const App: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>(INITIAL_PIPELINES);
  const [metrics, setMetrics] = useState<PipelineMetrics>(DEMO_METRICS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Active Modals
  const [selectedPipelineForTrigger, setSelectedPipelineForTrigger] = useState<string | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState<boolean>(false);
  const [activeLogsModal, setActiveLogsModal] = useState<{ pipeline: Pipeline; build: Build } | null>(null);
  const [activeSecurityModal, setActiveSecurityModal] = useState<{ pipeline: Pipeline; build: Build } | null>(null);
  const [activeDockerModal, setActiveDockerModal] = useState<{ pipeline: Pipeline; build: Build } | null>(null);

  // Synchronize modal state if active build is updated in background
  useEffect(() => {
    if (activeLogsModal) {
      const updatedPipe = pipelines.find((p) => p.id === activeLogsModal.pipeline.id);
      if (updatedPipe?.lastBuild) {
        setActiveLogsModal({ pipeline: updatedPipe, build: updatedPipe.lastBuild });
      }
    }
  }, [pipelines]);

  // Handler to open trigger modal
  const handleOpenTrigger = (pipelineId?: string) => {
    setSelectedPipelineForTrigger(pipelineId || null);
    setIsTriggerModalOpen(true);
  };

  // Live simulation execution of a pipeline in Demo Mode
  const handleTriggerPipeline = (pipelineId: string, options: TriggerOptions) => {
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

    // Run stage simulation steps asynchronously
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
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        onOpenTriggerModal={() => handleOpenTrigger()}
        buildsCount={metrics.totalBuilds}
      />

      {/* Demo Banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <div className="demo-banner-left">
            <span className="demo-badge-pill">Phase 1 Demo Mode</span>
            <div className="demo-banner-text">
              Displaying simulated CI/CD telemetry. <span>Click "Run Pipeline" to test live multi-stage execution, real-time log generation, or simulated test failures.</span>
            </div>
          </div>
          <button 
            className="demo-mode-toggle"
            onClick={() => setIsDemoMode(false)}
            title="Switch connection to FastAPI"
          >
            <span>FastAPI Setup Planned for Phase 2</span>
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
              onViewLogs={(pipe, bld) => setActiveLogsModal({ pipeline: pipe, build: bld })}
              onViewSecurity={(pipe, bld) => setActiveSecurityModal({ pipeline: pipe, build: bld })}
              onViewDocker={(pipe, bld) => setActiveDockerModal({ pipeline: pipe, build: bld })}
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

      {activeLogsModal && (
        <LiveLogsModal
          pipeline={activeLogsModal.pipeline}
          build={activeLogsModal.build}
          onClose={() => setActiveLogsModal(null)}
        />
      )}

      {activeSecurityModal && (
        <SecurityScanModal
          pipeline={activeSecurityModal.pipeline}
          build={activeSecurityModal.build}
          onClose={() => setActiveSecurityModal(null)}
        />
      )}

      {activeDockerModal && activeDockerModal.build.deployment && (
        <DockerStatusModal
          pipeline={activeDockerModal.pipeline}
          deployment={activeDockerModal.build.deployment}
          onClose={() => setActiveDockerModal(null)}
        />
      )}
    </div>
  );
};

export default App;
