import {
  BrowserWindow,
  Menu,
  app,
  dialog,
  globalShortcut,
  protocol,
} from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import { join } from 'path';
import { createMenu } from './menu';
import { EK } from '../../eventKeys'
import { accelerator } from './accelerator';
import { hooks } from './hooks';

const isDevelopment = import.meta.env.MODE === 'development';

let mainWindow: Electron.BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 720,
    width: 960,
    backgroundColor: '#6750a4',
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#6750a4',
      symbolColor: '#ffffff',
    },
    webPreferences: {
      webSecurity: false,
      contextIsolation: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  });

  const pageURL = isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined
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
  })
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

app.whenReady().then(() => {
  if (isDevelopment) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }

  Object.keys(accelerator).forEach((key) => {
    globalShortcut.register(key, accelerator[key]);
  });

  hooks(mainWindow);
})

app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');