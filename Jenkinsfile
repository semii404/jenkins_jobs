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
                    sh 'npm install'  // Install npm dependencies
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
                    image 'sonarsource/sonar-scanner-cli'
                    args '-v $PWD:/usr/src'
                }
            }
            steps {
                script {
                    // Run sonar-scanner and write output to a file
                    sh """
                        sonar-scanner \
                            -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_AUTH_TOKEN \
                            -Dsonar.qualitygate.wait=true \
                        | tee sonar_scan_output.log
                    """
                }

                // Archive the output log as a build artifact
                archiveArtifacts artifacts: 'sonar_scan_output.log', fingerprint: true
            }
        }

    }
}
