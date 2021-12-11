import { BrowserWindow, Menu, app, globalShortcut, protocol } from 'electron';
import { autoUpdater } from 'electron-updater';
import log, { ElectronLog } from 'electron-log';
import { join } from 'path';
import { createMenu } from './menu';
import { EK } from '../../eventKeys';
import { accelerator } from './accelerator';
import { hooks } from './hooks';

const isDevelopment = import.meta.env.MODE === 'development';

autoUpdater.logger = log;
(autoUpdater.logger as ElectronLog).transports.file.level = 'info';

protocol.registerSchemesAsPrivileged([{ scheme: 'stream', privileges: { stream: true } }]);

let mainWindow: Electron.BrowserWindow;

const createWindow = () => {
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    height: 720,
    width: 960,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  };

  if (process.platform === 'darwin') {
    windowOptions.vibrancy = 'dark';
  }

  if (process.platform === 'win32') {
    windowOptions.backgroundColor = '#6750a4';
    windowOptions.titleBarOverlay = {
      color: '#6750a4',
      symbolColor: '#ffffff',
    };
  }

  mainWindow = new BrowserWindow(windowOptions);

  const pageURL =
    isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  mainWindow.loadURL(pageURL);
};

const menu = Menu.buildFromTemplate(
  createMenu({
    togglePlay: () => {
      mainWindow.webContents.send(EK.togglePlay);
    },
    volumeUp: () => {
      mainWindow.webContents.send(EK.volumeUp);
    },
    volumeDown: () => {
      mainWindow.webContents.send(EK.volumeDown);
    },
    nextTrack: () => {
      mainWindow.webContents.send(EK.nextTrack);
    },
    prevTrack: () => {
      mainWindow.webContents.send(EK.prevTrack);
    },
    seekForward: () => {
      mainWindow.webContents.send(EK.seekForward);
    },
    seekBackward: () => {
      mainWindow.webContents.send(EK.seekBackward);
    },
  }),
);
Menu.setApplicationMenu(menu);

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('new-window-for-tab', () => {
  mainWindow.focus();
});

app.whenReady().then(async () => {
  if (isDevelopment) {
    const { installExtension } = await import.meta.glob('./devtools.ts')['./devtools.ts']();
    installExtension();
  }

  autoUpdater.checkForUpdatesAndNotify();

  Object.keys(accelerator).forEach((key) => {
    globalShortcut.register(key, accelerator[key]);
  });

  hooks(mainWindow);
});

app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
