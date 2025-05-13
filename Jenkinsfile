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
            agent none
            steps {
                script {
                    // SonarQube API URL for quality gate status
                    def apiUrl = "$SONAR_HOST_URL/api/qualitygates/project_status?projectKey=$SONAR_PROJECT_KEY"
                    
                    // Fetch the quality gate status using curl and parse the JSON response
                    def response = sh(script: "curl -s -u $SONAR_AUTH_TOKEN: $apiUrl", returnStdout: true).trim()
                    
                    // Parse the response and get the status
                    def jsonResponse = readJSON text: response
                    def status = jsonResponse.projectStatus.status

                    echo "SonarQube Quality Gate Status: ${status}"

                    // Check if the quality gate status is OK
                    if (status != 'OK') {
                        error "Quality gate failed: ${status}"
                    }
                }
            }
        }
    }
}
