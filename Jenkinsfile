pipeline {
    agent any

    environment {
        SONARQUBE = 'SonarQube' // Jenkins > Configure System > SonarQube server name
        SONAR_PROJECT_KEY = 'my_project_key' // Change to your actual project key
        SONAR_AUTH_TOKEN = credentials('SonarQube') // Jenkins Credentials ID
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/semii404/jenkins_jobs.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE}") {
                    sh '''
                        docker run --rm \
                          -v "$PWD":/usr/src \
                          sonarsource/sonar-scanner-cli \
                          -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
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
