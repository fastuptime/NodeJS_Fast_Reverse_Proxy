const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let database = JSON.parse(fs.readFileSync('database.json'));
fs.watchFile('database.json', (curr, prev) => {
    database = JSON.parse(fs.readFileSync('database.json'));
});

app.use('/', (req, res) => {
    const target = database.find(record => record.domain === req.headers.host);
    if (!target) {
        return res.sendStatus(500);
    }
    return createProxyMiddleware({ target: `http://localhost:${target.port}`, changeOrigin: true, onProxyReq: fixRequestBody, })(req, res);
});

app.listen(80, () => {
    console.log('Fast Reverse Proxy Başlatıldı!');
});
