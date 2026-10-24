const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const logDir = path.join(app ? app.getPath('userData') : __dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'app.log');

function logMsg(level, msg, err = '') {
  const line = `[${new Date().toISOString()}] [${level}] ${msg} ${err}\n`;
  fs.appendFileSync(logFile, line);
}

module.exports = {
  log: (msg) => logMsg('INFO', msg),
  error: (msg, err) => logMsg('ERROR', msg, err)
};

