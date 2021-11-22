declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.jpg';
declare namespace JSX {
  interface IntrinsicElements {
    webview: Electron.WebviewTag;
  }
}

interface Window {
  ipcRenderer: Electron.IpcRenderer;
  log: typeof import('electron-log');
  platform: NodeJS.Platform;
}
