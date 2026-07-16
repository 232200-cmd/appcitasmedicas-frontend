const scanner = require('sonarqube-scanner').default;

scanner(
    {
        serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
        token: process.env.SONAR_TOKEN,
        options: {
            'sonar.projectKey': 'appcitasmedicas-frontend',
            'sonar.projectName': 'MediCita - Frontend',
            'sonar.sources': 'src',
            'sonar.exclusions': '**/node_modules/**,**/dist/**,**/*.spec.ts,src/app/api/**',
            'sonar.sourceEncoding': 'UTF-8'
        }
    },
    () => process.exit()
);