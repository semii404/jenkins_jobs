pipeline {
    agent any

    environment {
        SONARQUBE = 'SonarQube' // Name from Jenkins > Configure System
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
