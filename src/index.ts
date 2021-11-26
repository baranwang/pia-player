import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  Menu,
  protocol,
} from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import { hooks } from './hooks';
import isDev from 'electron-is-dev';
import { Updater } from './updater';
import { accelerator } from './accelerator';
import { createMenu } from './menu';
import { EK } from './eventKeys';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const VIEW_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: Electron.BrowserWindow;

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
  })
);
Menu.setApplicationMenu(menu);

protocol.registerSchemesAsPrivileged([
  { scheme: 'stream', privileges: { stream: true } },
]);

const createWindow = (): void => {
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
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
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

  Object.keys(accelerator).forEach((_key) => {
    const key = _key as keyof typeof accelerator;
    globalShortcut.register(key, accelerator[key]);
  });

  hooks(mainWindow, VIEW_WINDOW_PRELOAD_WEBPACK_ENTRY);

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

app.on('new-window-for-tab', () => {
  mainWindow.focus();
});

// app.setAsDefaultProtocolClient('pia-player');

// app.on('open-url', (event, args) => {
//   const url = args.replace(new RegExp('^pia-player://'), '');
//   console.log(url);
// });
