var express = require('express');
var proxy = require('http-proxy-middleware');

var app = express();
app.use(express.static('build'));
app.use(
    '/api',
    proxy({
        target: 'http://brain:8080',
        pathRewrite: { '^/api': '' }, // Remove /api prefix
        changeOrigin: true,
    }),
);
app.listen(5000);
