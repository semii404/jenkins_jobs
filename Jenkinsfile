pipeline {
    agent none

    environment {
        SONARQUBE = 'SonarQube'            // Name from Jenkins > Configure System
        SONAR_PROJECT_KEY = 'my_project_key'
        SONAR_AUTH_TOKEN = credentials('SonarQube')  // Credentials from Jenkins
        SONAR_HOST_URL = 'http://host.docker.internal:9000'  // Set your SonarQube host URL
    }

    stages {
        stage('Checkout') {
            agent any
            steps {
                git branch: 'main', url: 'https://github.com/semii404/jenkins_jobs.git'
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:16'
                    args '-v $PWD:/usr/src'
                }
            }
            steps {
                script {
                    sh 'echo npminstall'  // Install npm dependencies
                }
            }
        }

        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '-v $PWD:/usr/src'
                }
            }
            steps {
                withSonarQubeEnv("${SONARQUBE}") {
                    sh '''
                        sonar-scanner -X \
                          -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Quality Gate Check') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'  // Using the same Docker image as SonarQube Analysis
                    args '-v $PWD:/usr/src'
                }
            }
            steps {
                script {
                    // Wait for the analysis to complete and fetch the quality gate status using sonar-scanner CLI
                    def qualityGateStatus = sh(script: """
                        sonar-scanner -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_AUTH_TOKEN \
                        -Dsonar.qualitygate.wait=true
                    """)
                    echo $qualityGateStatus
                    // Check the quality gate status in the output
                    // if (qualityGateStatus.contains("Quality gate status: OK")) {
                    //     echo "SonarQube Quality Gate Status: OK"
                    // } else {
                    //     error "Quality gate failed: ${qualityGateStatus}"
                    // }
                }
            }
        }
    }
}
