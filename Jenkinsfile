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

                        echo "Installing frontend dependencies..."
                        npm ci

                        echo "Running frontend lint..."
                        npm run lint

                        echo "Building React frontend..."
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

                        echo "Creating Python virtual environment..."
                        python3 -m venv .venv-ci
                        . .venv-ci/bin/activate

                        echo "Installing backend dependencies..."
                        python -m pip install -r requirements.txt

                        echo "Running backend API tests..."
                        python -m unittest discover -s tests -v
                    '''
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    set -eu

                    echo "Scanning project for security issues..."

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
    }

    post {
        success {
            echo 'SUCCESS: Frontend, backend tests, and Trivy scan completed!'
        }

        failure {
            echo 'FAILURE: Check the console output for the failing stage.'
        }
    }
}