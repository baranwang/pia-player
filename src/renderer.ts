import './app';
import { EK } from './eventKeys';

window.addEventListener('contextmenu', (e) => {
  if (e.target instanceof HTMLInputElement) return
  window.ipcRenderer.send(EK.showContextMenu);
})