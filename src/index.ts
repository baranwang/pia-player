import { app, BrowserWindow, dialog, globalShortcut, Menu, protocol, shell } from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import { hooks } from './hooks';
import isDev from 'electron-is-dev';
import { Updater } from './updater';
import { accelerator } from './accelerator'
import { EK } from './eventKeys';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: Electron.BrowserWindow;

const menu = Menu.buildFromTemplate([...(process.platform === 'darwin' ? [{
  label: app.name,
  submenu: [
    { role: 'about', label: `关于 ${app.name}` },
    { type: 'separator' },
    // { label: 'Preferences', accelerator: 'CmdOrCtrl+,' },
    // { type: 'separator' },
    { role: 'hide', label: `隐藏 ${app.name}` },
    { role: 'hideOthers', label: `隐藏其他` },
    { role: 'unhide', label: `全部显示` },
    { type: 'separator' },
    { role: 'quit', label: `退出 ${app.name}` },
  ]
}] : []) as Array<(Electron.MenuItemConstructorOptions) | (Electron.MenuItem)>, {
  label: '控制',
  submenu: [
    {
      label: '播放/暂停', accelerator: 'Space', click: () => {
        mainWindow.webContents.send(EK.togglePlay)
      }
    },
    { type: 'separator' },
    {
      label: '音量+', accelerator: 'up', click: () => {
        mainWindow.webContents.send(EK.volumeUp)
      }
    },
    {
      label: '音量-', accelerator: 'down', click: () => {
        mainWindow.webContents.send(EK.volumeDown)
      }
    },
    { type: 'separator' },
    { label: '重新载入页面', accelerator: 'CmdOrCtrl+r', click: accelerator['CmdOrCtrl+r'] },
  ]
}, {
  label: '窗口',
  submenu: [
    { role: 'minimize', label: `最小化 ${app.name}` },
    { role: 'zoom', label: `最大化 ${app.name}` },
  ]
}, {
  label: '帮助',
  submenu: [
    {
      role: 'help', label: `报告问题`, click: () => {
        shell.openExternal('https://github.com/baranwang/pia-player/issues')
      }
    },
    { type: 'separator' },
  ]
}])
Menu.setApplicationMenu(menu);

protocol.registerSchemesAsPrivileged([
  { scheme: 'stream', privileges: { stream: true } },
])

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
      webviewTag: true,
      contextIsolation: false,
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
    globalShortcut.register(key, accelerator[key])
  })

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
