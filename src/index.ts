import { app, BrowserWindow, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as fs from 'fs';
import * as path from 'path';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import { hooks } from './hooks';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'baranwang',
  repo: 'pia-player',
});

let mainWindow: Electron.BrowserWindow;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 720,
    width: 960,
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));

  globalShortcut.register('CommandOrControl+F12', () => {
    mainWindow.webContents.openDevTools();
  });

  hooks(mainWindow);
});

app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
