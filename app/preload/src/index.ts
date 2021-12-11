import { contextBridge, ipcRenderer } from 'electron';
import log from 'electron-log';
import { EK } from '/@eventKeys';

contextBridge.exposeInMainWorld('platform', process.platform);
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add(process.platform);
});

contextBridge.exposeInMainWorld('log', log);

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: ipcRenderer.on.bind(ipcRenderer),
  send: ipcRenderer.send.bind(ipcRenderer),
  sendSync: ipcRenderer.sendSync.bind(ipcRenderer),
  removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  invoke: ipcRenderer.invoke.bind(ipcRenderer),
});

window.addEventListener('contextmenu', (e) => {
  if (e.target instanceof HTMLInputElement) {
    // TODO: add context menu for input elements
  } else {
    ipcRenderer.send(EK.showContextMenu);
  }
});
