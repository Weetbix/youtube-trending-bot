const express = require('express');
const setupProxy = require('./src/setupProxy');

var app = express();
app.use(express.static('build'));
setupProxy(app, true);
app.listen(5000);
