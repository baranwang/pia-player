declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.jpg';

type ElectronLog = typeof import('electron-log');
declare namespace JSX {
  interface IntrinsicElements {
    webview: Electron.WebviewTag;
  }
}

interface Window {
  ipcRenderer: Electron.IpcRenderer;
  /**
   *
   */
  log: ElectronLog;
}
