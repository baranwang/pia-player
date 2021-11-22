import { BrowserWindow } from 'electron'

export const accelerator = {
  'CmdOrCtrl+r': () => {
    BrowserWindow.getFocusedWindow()?.webContents.reload()
  },
  'CommandOrControl+F12': () => {
    BrowserWindow.getFocusedWindow()?.webContents.toggleDevTools()
  }
}