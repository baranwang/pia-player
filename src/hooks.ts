import { app, BrowserWindow, ipcMain, net, session } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

export const hooks = (mainWindow: Electron.BrowserWindow) => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: Object.assign(details.responseHeaders, {
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: file: ws: data: blob:",
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

  ipcMain.handle('request', async (event, args) => {
    const url = new URL(args.url);
    Object.keys(args.params).forEach((key) => {
      url.searchParams.append(key, args.params[key]);
    });
    console.log('[request]', url.toString());
    return new Promise((resolve, reject) => {
      const req = net.request(url.toString());
      req.on('response', (response) => {
        const res: Buffer[] = [];
        response.on('data', (chuck) => {
          res.push(chuck);
        });
        response.on('error', reject);
        response.on('end', () => {
          const data = Buffer.concat(res);
          try {
            resolve(JSON.parse(data.toString()));
          } catch (error) {
            if (response.statusCode < 400) {
              resolve(data);
            } else {
              reject(data.toString());
            }
          }
        });
      });
      req.end();
    });
  });

  ipcMain.handle(
    'saveFile',
    (
      event,
      args: {
        arrayBuffer: ArrayBuffer;
        filename: string;
      }
    ) => {
      const filepath = path.resolve(
        app.getPath('userData'),
        'BGM Cache',
        args.filename
      );
      try {
        fs.writeFileSync(filepath, Buffer.from(args.arrayBuffer));
        return filepath;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  );

  ipcMain.handle('checkFile', (event, filename) => {
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
    'view',
    async (
      event,
      args: {
        id: number;
        title: string;
      }
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { screen } = require('electron');
      const dramaWindow = new BrowserWindow({
        parent: mainWindow,
        title: args.title,
        width: 960,
        height: screen.getPrimaryDisplay().workAreaSize.height * 0.75,
        minimizable: false,
        maximizable: false,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
        },
      });
      dramaWindow.removeMenu();
      dramaWindow.loadURL(`https://aipiaxi.com/Index/post/id/${args.id}`);
      dramaWindow.webContents.on('did-finish-load', () => {
        dramaWindow.setTitle(args.title);
      });
      dramaWindow.webContents.insertCSS(
        `.player-bar,
        .nav,
        .footer,
        .article-header .middle,
        .article-header .real-love-rank,
        #similar-work,
        #comment-list,
        #authorInfo,
        .control-field .fav-btn,
        .control-field .clipboard-btn {
          display: none !important;
        }          
        .article-detail-page {
          margin-left: auto;
          margin-right: auto;
        }    
        .author-name {
          pointer-events: none;
        }
        #content {
          user-select: text;
        }
        `
      );
      dramaWindow.webContents.session.webRequest.onBeforeRequest(
        {
          urls: ['https://aipiaxi.com/advance/search*'],
        },
        (details, callback) => {
          mainWindow.webContents.send('search', details.url);
          callback({ cancel: true });
          dramaWindow.destroy();
        }
      );
    }
  );
};
