const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const tiktok = require('./tiktok');
const logger = require('./logger');

let server;
let wss;

function start() {
  return new Promise((resolve, reject) => {
    const app = express();
    server = http.createServer(app);
    wss = new WebSocket.Server({ server });

    app.use('/renderer', express.static(path.join(__dirname, '../renderer')));
    app.get('/health', (req, res) => res.sendStatus(200));

    wss.on('connection', (ws) => {
      logger.log('UI conectada por WS');
      ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.action === 'connect') tiktok.connect(data.username, wss);
        if (data.action === 'disconnect') tiktok.disconnect(wss);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      logger.log(`Servidor Express corriendo en puerto ${port}`);
      resolve(port);
    });
    server.on('error', reject);
  });
}

function stop() {
  tiktok.disconnect();
  if (server) server.close();
}

module.exports = { start, stop };

