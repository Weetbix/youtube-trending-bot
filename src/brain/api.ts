import express = require('express');

const DEFAULT_PORT = 8080;

export default function(port: number = DEFAULT_PORT) {
    const app = express();

    app.get(`/status`, (req, res, next) => {
        res.status(200).json({
            status: 'ok',
        });
    });

    app.listen(port);

    return app;
}
