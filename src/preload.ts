import { contextBridge, ipcRenderer } from 'electron';
import log from 'electron-log';

contextBridge.exposeInMainWorld('platform', process.platform);
contextBridge.exposeInMainWorld('log', log);

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: ipcRenderer.on.bind(ipcRenderer),
  send: ipcRenderer.send.bind(ipcRenderer),
  sendSync: ipcRenderer.sendSync.bind(ipcRenderer),
  removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  invoke: ipcRenderer.invoke.bind(ipcRenderer),
});
