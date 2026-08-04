const scanner = require('sonarqube-scanner').default;

scanner(
    {
        serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
        token: process.env.SONAR_TOKEN || 'squ_1edeacef5af0b2d3280975c2520c953feaf419fc',
        options: {
            'sonar.projectKey': 'appcitasmedicas-frontend',
            'sonar.projectName': 'MediCita - Frontend',
            'sonar.sources': 'src',
            'sonar.exclusions': '**/node_modules/**,**/dist/**,**/*.spec.ts,src/app/api/**,src/main.ts,src/app/app.config.ts,src/app/app.routes.ts,src/test-setup.ts,src/app/page/appointment/appointment-insert/**,src/app/page/appointment/my-appointments/**,src/app/auth/auth.guard.ts,src/app/auth/auth.interceptor.ts',
            'sonar.sourceEncoding': 'UTF-8'
        }
    },
    () => process.exit()
);