pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout Source') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/victor-dinesh/devops'
            }
        }

        stage('Frontend Lint and Build') {
            steps {
                dir('frontend') {
                    sh '''
                        set -eu
                        npm ci
                        npm run lint
                        npm run build
                    '''
                }
            }
        }

        stage('Backend API Tests') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu
                        python3 -m venv .venv-ci
                        . .venv-ci/bin/activate
                        python -m pip install -r requirements.txt
                        python -m unittest discover -s tests -v
                    '''
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    set -eu
                    trivy fs \
                        --scanners vuln,misconfig,secret \
                        --severity HIGH,CRITICAL \
                        --include-dev-deps \
                        --exit-code 0 \
                        --skip-dirs .git \
                        --skip-dirs frontend/node_modules \
                        --skip-dirs backend/.venv-ci \
                        --skip-dirs '**/__pycache__' \
                        .
                '''
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh '''
                    set -eu
                    docker compose -p autopipeline -f compose.yaml config > /dev/null
                    echo "Docker Compose configuration is valid."
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu
                    docker compose -p autopipeline -f compose.yaml build
                '''
            }
        }

        stage('Deploy Containers') {
            steps {
                sh '''
                    set -eu
                    docker compose -p autopipeline -f compose.yaml up -d
                    docker compose -p autopipeline -f compose.yaml ps
                '''
            }
        }

        stage('Deployment Smoke Test') {
            steps {
                sh '''
                    set -eu

                    echo "Checking backend health..."
                    docker exec autopipeline-backend python -c \
                        "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=5).read().decode())"

                    echo "Checking frontend-to-backend connection..."
                    docker exec autopipeline-frontend wget -qO- \
                        http://127.0.0.1/api/health

                    echo
                    echo "Deployment smoke tests passed."
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Tests, security scan, Docker build, deployment, and smoke tests completed!'
        }

        failure {
            echo 'FAILURE: Inspect the console output to identify the failing stage.'
        }
    }
}