pipeline {
    agent none  // Use no global agent to define specific agents for each stage

    environment {
        SONARQUBE = 'SonarQube'
        SONAR_PROJECT_KEY = 'my_project_key'
        SONAR_AUTH_TOKEN = credentials('SonarQube')  // Jenkins credential for SonarQube token
    }

    stages {
        stage('Checkout') {
            agent any  // Can run on any available agent
            steps {
                git branch: 'main', url: 'https://github.com/semii404/jenkins_jobs.git'
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:16'  // Use Node.js Docker image for installing npm dependencies
                    args '-v $PWD:/usr/src'  // Mount the working directory
                }
            }
            steps {
                script {
                    // Install Node.js dependencies
                    sh 'npm install'
                }
            }
        }

        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'  // Use SonarQube scanner image
                    args '-v $PWD:/usr/src'  // Mount the working directory
                }
            }
            steps {
                withSonarQubeEnv("${SONARQUBE}") {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage("Quality Gate") {
            agent any  // Can run on any available agent
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
