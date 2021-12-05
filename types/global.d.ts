declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.jpg';

declare module '@ffmpeg/core';

interface ObjectConstructor {
  keys<T extends object>(o: T): Array<keyof T>
}

interface Window {
  ipcRenderer: import('electron').IpcRenderer;
  log: typeof import('electron-log');
  platform: NodeJS.Platform;

  insertCSS: string;
}