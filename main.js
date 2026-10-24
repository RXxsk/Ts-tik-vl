const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const server = require('./server/index');

// Desactivar completamente la GPU y el sandbox para evitar cualquier fallo en VMs/Servidores
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow;

  app.whenReady().then(async () => {
    mainWindow = new BrowserWindow({
      width: 1100,
      height: 760,
      minWidth: 380,
      minHeight: 600,
      icon: path.join(__dirname, 'build/icon.ico'),
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'loading.html'));
    mainWindow.show();

    try {
      const port = await server.start();
      let attempts = 0;
      const checkHealth = setInterval(() => {
        attempts++;
        require('http').get(`http://127.0.0.1:${port}/health`, (res) => {
          if (res.statusCode === 200) {
            clearInterval(checkHealth);
            mainWindow.loadURL(`http://127.0.0.1:${port}/index.html`);
          }
        }).on('error', () => {
          if (attempts > 15) {
            clearInterval(checkHealth);
            showError('El servidor local tardó demasiado en iniciar.');
          }
        });
      }, 1000);
    } catch (err) {
      showError(err.message);
    }
  });

  app.on('window-all-closed', () => {
    server.stop();
    if (process.platform !== 'darwin') app.quit();
  });

  ipcMain.handle('open-logs', () => {
    shell.showItemInFolder(path.join(app.getPath('userData'), 'logs', 'app.log'));
  });
}

function showError(msg) {
  dialog.showErrorBox('Error de Inicio', `No se pudo iniciar el servidor local:\n${msg}\n\nRevisa los logs.`);
  app.quit();
}
