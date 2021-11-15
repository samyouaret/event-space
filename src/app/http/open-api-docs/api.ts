
export const apiDoc = {
    openapi: '3.0.1',
    info: {
        version: '1.0.0',
        title: 'Event Space',
        description: 'Event Space REST API',
        termsOfService: 'http://api_url/terms/',
        contact: {
            name: 'Samy Ouaret',
            email: 'samyouaret13@gmail.com',
            url: 'https://samyouaret.me/'
        },
        license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000/',
            description: 'Local server'
        },
        {
            url: 'https://api_url_testing',
            description: 'Testing server'
        },
        {
            url: 'https://api_url_production',
            description: 'Production server'
        }
    ],
};