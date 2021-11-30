import { app, shell } from 'electron';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

const checkURL = 'https://pia-player.baran.wang/api/latest/check';
const downloadURL = `https://pia-player.baran.wang/api/latest/${process.platform}`;
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

  public async checkForUpdates() {
    const { status, json } = await fetch(checkURL)
    if (status === 200) {
      const { name, notes } = await json() as { name: string, notes: string };
      this.updateData = {
        name,
        notes,
        url: downloadURL
      }
    }
  }

  public async downloadUpdate() {
    if (!this.updateData) return;
    const { url } = this.updateData;
    const filePath = `${app.getPath('downloads')}/${path.basename(url)}`;
    const file = fs.createWriteStream(filePath);
    fetch(url).then(res => {
      res.body?.pipe(file);
      res.body?.on('end', () => {
        this.updateFilePath = filePath;
      })
    })
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
    shell.openPath(filePath).then(() => {
      app.quit();
    })
  }
}
