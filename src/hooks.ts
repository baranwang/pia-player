/* eslint-disable @typescript-eslint/no-var-requires */
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  protocol,
  session,
} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Pinyin } from '@baranwang/pinyin';
import { EK } from './eventKeys';

const pinyin = new Pinyin();

const playIcon = nativeImage.createFromPath(
  path.resolve(__dirname, require('./components/Player/assets/play.png'))
);
const pauseIcon = nativeImage.createFromPath(
  path.resolve(__dirname, require('./components/Player/assets/pause.png'))
);
const skipPrevIcon = nativeImage.createFromPath(
  path.resolve(
    __dirname,
    require('./components/Player/assets/skip_previous.png')
  )
);
const skipNextIcon = nativeImage.createFromPath(
  path.resolve(__dirname, require('./components/Player/assets/skip_next.png'))
);

export const hooks = (
  mainWindow: Electron.BrowserWindow,
  VIEW_WINDOW_PRELOAD_WEBPACK_ENTRY: string
) => {
  protocol.registerStreamProtocol('stream', (request, callback) => {
    const url = request.url.replace(new RegExp('^stream://'), '');
    const filepath = decodeURIComponent(url);
    callback({
      data: fs.createReadStream(filepath),
      headers: {
        'Content-Length': `${fs.statSync(filepath).size}`,
      },
    });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: Object.assign(details.responseHeaders, {
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: ws: data: blob: stream:",
        ],
      }),
    });
  });

  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://api.aipiaxi.com/*'] },
    (details, callback) => {
      let token;
      try {
        token = fs.readFileSync(
          path.resolve(app.getPath('userData'), 'token'),
          'utf-8'
        );
      } catch (e) {
        // do nothing
      }
      if (token) {
        details.requestHeaders['Authorization'] = token;
      }
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://*.aipiaxi.com/*'] },
    (details, callback) => {
      details.requestHeaders['referer'] = 'https://aipiaxi.com/';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: ['https://static.piaxiya.com/*'],
    },
    (details, callback) => {
      const url = details.url.replace(
        'https://static.piaxiya.com',
        'https://static.aipiaxi.com'
      );
      callback({ redirectURL: url });
    }
  );

  ipcMain.handle(
    EK.saveFile,
    (
      event,
      args: {
        arrayBuffer: ArrayBuffer;
        filename: string;
      }
    ) => {
      const dir = path.resolve(app.getPath('userData'), 'BGM Cache');
      fs.existsSync(dir) || fs.mkdirSync(dir);
      const filepath = path.resolve(dir, args.filename);
      try {
        fs.writeFileSync(filepath, Buffer.from(args.arrayBuffer));
        return filepath;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  );

  ipcMain.handle(EK.checkFile, (event, filename) => {
    const dir = path.resolve(app.getPath('userData'), 'BGM Cache');
    fs.existsSync(dir) || fs.mkdirSync(dir);
    const filepath = path.resolve(dir, filename);
    try {
      return fs.existsSync(filepath);
    } catch (error) {
      console.error(error);
      return false;
    }
  });

  ipcMain.on(
    EK.changeMenu,
    (
      event,
      args: {
        controls: MenusControls;
        isPlaying: boolean;
        coverRect?: Electron.Rectangle;
      }
    ) => {
      const { controls = [], isPlaying = false } = args;
      const controlList = [
        'togglePlay',
        'volumeUp',
        'volumeDown',
        'nextTrack',
        'prevTrack',
      ] as const;
      controlList.forEach((key) => {
        const appMenu = Menu.getApplicationMenu();
        if (!appMenu) return;
        [key, `_${key}`].forEach((item) => {
          const menuItem = appMenu.getMenuItemById(item);
          if (!menuItem) return;
          menuItem.enabled = controls.includes(key);
        });
      });

      mainWindow.setThumbarButtons([
        {
          icon: skipPrevIcon,
          click: () => {
            mainWindow.webContents.send(EK.prevTrack);
          },
          tooltip: '上一首',
          flags: controls.includes('prevTrack') ? undefined : ['disabled'],
        },
        {
          icon: isPlaying ? pauseIcon : playIcon,
          click: () => {
            mainWindow.webContents.send(EK.togglePlay);
          },
          tooltip: isPlaying ? '暂停' : '播放',
          flags: controls.includes('togglePlay') ? undefined : ['disabled'],
        },
        {
          icon: skipNextIcon,
          click: () => {
            mainWindow.webContents.send(EK.nextTrack);
          },
          tooltip: '下一首',
          flags: controls.includes('nextTrack') ? undefined : ['disabled'],
        },
      ]);
    }
  );

  ipcMain.on(EK.showContextMenu, () => {
    Menu.getApplicationMenu()?.popup({
      window: mainWindow,
    });
  });

  ipcMain.on(
    EK.view,
    async (
      event,
      args: {
        id: number;
        title: string;
      }
    ) => {
      const { screen } = require('electron');
      const viewWindow = new BrowserWindow({
        title: args.title,
        width: 960,
        height: screen.getPrimaryDisplay().workAreaSize.height * 0.75,
        tabbingIdentifier: 'view',
        webPreferences: {
          preload: VIEW_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
      });
      viewWindow.removeMenu();
      viewWindow.loadURL(`https://aipiaxi.com/Index/post/id/${args.id}`);
      viewWindow.webContents.on('did-finish-load', () => {
        viewWindow.setTitle(args.title);
      });

      viewWindow.webContents.insertCSS(require('./view/insert.css'));
      viewWindow.webContents.session.webRequest.onBeforeRequest(
        {
          urls: ['https://aipiaxi.com/advance/search*'],
        },
        (details, callback) => {
          mainWindow.webContents.send(EK.search, details.url);
          callback({ cancel: true });
          viewWindow.destroy();
        }
      );
    }
  );

  ipcMain.handle(EK.pinyin, (event, args) => {
    return pinyin.get(args);
  });
};
