const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  openLogs: () => ipcRenderer.invoke('open-logs')
});

