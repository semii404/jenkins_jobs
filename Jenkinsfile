pipeline {
    agent any

    environment {
        SONARQUBE = 'SonarQube' // Name defined in Configure System
    }

    tools {
        sonarQube 'SonarScanner' // Name defined in Configure System
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/semii404/jenkins_jobs.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage("Quality Gate") {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
