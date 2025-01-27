pipeline {
    agent any

    environment {
        NODE_VERSION = '16' 
    }

    stages {
        stage('Checkout') {
            steps {
                // Pobierz kod z repozytorium
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Zainstaluj zależności Node.js
                script {
                    def nodeHome = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                bat 'C:\\Program Files\\Git\\bin\\sh.exe -c "npm install"'
            }
        }

        stage('Run Cypress Tests') {
            steps {
                // Uruchom testy Cypress
                bat 'C:\\Program Files\\Git\\bin\\sh.exe -c "npx cypress run"'
            }
        }

        stage('Build') {
            steps {
                // Dodaj kroki builda, jeśli są potrzebne (np. kompilacja aplikacji)
                echo 'Building the application...'
            }
        }

        stage('Deploy') {
            steps {
                // Tutaj umieść kroki deploymentu, jeśli dotyczy
                echo 'Deploying the application...'
            }
        }
    }

    post {
        always {
            // Zawsze wyświetl raporty
            echo 'Pipeline zakończony.'
        }
        success {
            echo 'Pipeline zakończony sukcesem!'
        }
        failure {
            echo 'Pipeline zakończony porażką!'
        }
    }
}
