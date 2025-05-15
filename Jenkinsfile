pipeline {
    agent none

    environment {
        REPO_NAME = 'MERN'  // <--- Make repo name a variable
        SONAR_PROJECT_KEY = 'my_project_key'
        SONAR_HOST_URL = 'http://host.docker.internal:9000'
    }

    stages {
        stage('Checkout') {
            agent any
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_TOKEN')]) {
                    script {
                        // Cleanup if directory exists
                        sh """
                            if [ -d "${REPO_NAME}" ]; then
                                echo "Cleaning up existing directory: ${REPO_NAME}"
                                rm -rf "${REPO_NAME}"
                            fi
                        """

                        // Securely clone using env vars without Groovy interpolation
                        sh 'git clone https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/semii404/${REPO_NAME}.git'
                    }
                }
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
                dir(env.REPO_NAME) {
                    sh 'npm install'
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
                withCredentials([string(credentialsId: 'SonarQube', variable: 'SONAR_AUTH_TOKEN')]) {
                    dir(env.REPO_NAME) {
                        sh '''
                            sonar-scanner -X \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=${SONAR_HOST_URL} \
                              -Dsonar.login=${SONAR_AUTH_TOKEN}
                        '''
                    }
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
                withCredentials([string(credentialsId: 'SonarQube', variable: 'SONAR_AUTH_TOKEN')]) {
                    dir(env.REPO_NAME) {
                        script {
                            sh """
                                sonar-scanner \
                                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                    -Dsonar.host.url=${SONAR_HOST_URL} \
                                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                    -Dsonar.qualitygate.wait=true \
                                    | tee sonar_scan_output.log
                            """

                            def sonarApiUrl = "${SONAR_HOST_URL}/api/issues/search?projectKeys=${SONAR_PROJECT_KEY}&issueStatuses=OPEN,CONFIRMED"
                            def issues = sh(script: "curl -s -u ${SONAR_AUTH_TOKEN}: ${sonarApiUrl}", returnStdout: true).trim()

                            def jsonResponse = readJSON text: issues
                            def prettyJson = writeJSON returnText: true, json: jsonResponse, pretty: 4
                            writeFile file: 'sonar_issues_report.json', text: prettyJson

                            archiveArtifacts artifacts: 'sonar_scan_output.log', fingerprint: true
                            archiveArtifacts artifacts: 'sonar_issues_report.json', fingerprint: true

                            echo "SonarQube Issues: ${prettyJson}"

                            if (jsonResponse.total > 0) {
                                error "Build failed due to ${jsonResponse.total} open/confirmed issues in SonarQube."
                            }
                        }
                    }
                }
            }
        }
    }
}
