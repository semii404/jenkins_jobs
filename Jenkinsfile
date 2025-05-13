pipeline {
    agent {
        docker {
            image 'sonarsource/sonar-scanner-cli'
            args '-v $PWD:/usr/src'
        }
    }

    environment {
        SONARQUBE = 'SonarQube'
        SONAR_PROJECT_KEY = 'my_project_key'
        SONAR_AUTH_TOKEN = credentials('SonarQube')
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
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}
