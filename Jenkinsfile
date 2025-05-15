pipeline {
    agent none

    environment {          // Name from Jenkins > Configure System
        SONAR_PROJECT_KEY = 'my_project_key'
        SONAR_AUTH_TOKEN = credentials('SonarQube')  // Credentials from Jenkins
        SONAR_HOST_URL = 'http://host.docker.internal:9000'  // Set your SonarQube host URL
    }

    stages {
        stage('Checkout') {
            agent any
            steps {
                git credentialsId: 'github-token', branch: 'main', url: 'https://github.com/semii404/MERN.git'
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
              script {
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
                    // Step 1: Run sonar-scanner for project analysis
                    sh """
                        sonar-scanner \
                            -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_AUTH_TOKEN \
                            -Dsonar.qualitygate.wait=true \
                            | tee sonar_scan_output.log
                    """

                    // Step 2: Query issues using API
                    def sonarApiUrl = "${SONAR_HOST_URL}/api/issues/search?projectKeys=${SONAR_PROJECT_KEY}&issueStatuses=OPEN%2CCONFIRMED"
                    def curlCommand = """curl -u "$SONAR_AUTH_TOKEN:" "$sonarApiUrl" """
                    def issues = sh(script: curlCommand, returnStdout: true).trim()

                    def jsonResponse = readJSON text: issues
                    def prettyJson = writeJSON returnText: true, json: jsonResponse, pretty: 4
                    writeFile file: 'sonar_issues_report.json', text: prettyJson

                    // Step 4: Archive sonar scan output and JSON report
                    archiveArtifacts artifacts: 'sonar_scan_output.log', fingerprint: true
                    archiveArtifacts artifacts: 'sonar_issues_report.json', fingerprint: true

                    // Step 5: Optionally print issues
                    echo "SonarQube Issues: ${prettyJson}"

                    // if (jsonResponse.total > 0) {
                    //     error "Build failed due to ${jsonResponse.total} open/confirmed issues in SonarQube."
                    // }
                }

            }
        }
    }
}
