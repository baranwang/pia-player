import { app, BrowserWindow, dialog, globalShortcut } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import { hooks } from './hooks';
import isDev from 'electron-is-dev';
import { Updater } from './updater';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: Electron.BrowserWindow;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 720,
    width: 960,
    backgroundColor: '#6750a4',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#6750a4',
      symbolColor: '#ffffff',
    },
    webPreferences: {
      webSecurity: false,
      webviewTag: true,
      contextIsolation: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.removeMenu();
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on('did-finish-load', () => {
    try {
      const userData = fs.readFileSync(
        path.join(app.getPath('userData'), 'userData.json'),
        'utf-8'
      );
      mainWindow.webContents.send('userData', JSON.parse(userData));
    } catch (error) {
      //  do nothing
    }
  });
};

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

app.whenReady().then(() => {
  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }
  globalShortcut.register('CommandOrControl+F12', () => {
    mainWindow.webContents.openDevTools();
  });

  hooks(mainWindow);

  const updater = new Updater();
  setInterval(() => {
    updater.checkForUpdatesAndDownload();
  }, 1000 * 60 * 60);
  updater.onUpdateAvailable = (updateData) => {
    dialog
      .showMessageBox({
        type: 'info',
        buttons: ['安装', '稍后'],
        title: '应用程序更新',
        message: updateData.notes || '有新版本可用',
        detail: '已下载新版本，是否安装更新？',
      })
      .then(({ response }) => {
        if (response === 0) {
          updater.quitAndInstall();
        }
      });
  };
});

app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
