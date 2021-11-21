import axios from 'axios';
import { app, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import semver from 'semver';
import type { Release } from '@octokit/webhooks-types';

const updateURL = `https://api.github.com/repos/baranwang/pia-player/releases/latest`;

interface UpdateInfo {
  name: string;
  notes: string;
  url: string;
}

export class Updater {
  constructor() {
    this.checkForUpdatesAndDownload();
  }

  private updateData?: UpdateInfo;

  private _updateFilePath?: string;

  get updateFilePath() {
    return this._updateFilePath;
  }

  set updateFilePath(updateFilePath: string | undefined) {
    this._updateFilePath = updateFilePath;
    this.onUpdateFilePathChange(updateFilePath);
  }

  public onDownloadProgress: ((progressEvent: any) => void) | undefined;

  public async checkForUpdates() {
    const { tag_name, assets, body } = (await axios.get<Release>(updateURL))
      .data;
    const latestVersion = semver.coerce(tag_name)!;
    const currentVersion = semver.coerce(app.getVersion())!;
    if (semver.gt(latestVersion, currentVersion)) {
      let extname: string;
      if (process.platform === 'win32') {
        extname = '.exe';
      }
      if (process.platform === 'darwin') {
        extname = '.dmg';
      }
      const fileInfo = assets.find((asset) => asset.name.endsWith(extname));
      this.updateData = {
        name: latestVersion.raw,
        notes: body,
        url: fileInfo!.browser_download_url,
      };
    }
  }

  public async downloadUpdate() {
    if (!this.updateData) return;
    const { url } = this.updateData;
    axios
      .get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress: this.onDownloadProgress,
      })
      .then((res) => {
        if (res.status === 200) {
          const filePath = `${app.getPath('downloads')}/${path.basename(url)}`;
          const file = fs.createWriteStream(filePath);
          file.write(res.data);
          file.close();
          this.updateFilePath = `file://${filePath}`;
        }
      });
  }

  public async checkForUpdatesAndDownload() {
    await this.checkForUpdates();
    await this.downloadUpdate();
  }

  private onUpdateFilePathChange(updateFilePath: string | undefined) {
    if (updateFilePath) {
      this.onUpdateAvailable?.(this.updateData!);
    }
  }

  public onUpdateAvailable: ((updateData: UpdateInfo) => void) | undefined;

  public async quitAndInstall() {
    if (!this.updateFilePath) return;
    const filePath = this.updateFilePath;
    app.quit();
    shell.openExternal(filePath);
  }
}
