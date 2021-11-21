import { ipcRenderer } from 'electron';
import log from 'electron-log';

window.ipcRenderer = ipcRenderer;
window.log = log;