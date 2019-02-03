// Used for both the dev proxy and the production proxy
// See: https://facebook.github.io/create-react-app/docs/proxying-api-requests-in-development
// Fwds requests to the api
const proxy = require('http-proxy-middleware');

module.exports = function(app, production = false) {
    const host = production ? 'brain' : 'localhost';
    app.use(
        proxy('/api', {
            target: `http://${host}:8080/`,
            // Remove /api prefix
            pathRewrite: { '^/api': '' },
        }),
    );
};
