import { BrowserWindow } from 'electron'

export const accelerator = {
  'CmdOrCtrl+r': () => {
    BrowserWindow.getFocusedWindow()?.webContents.reload()
  },
  'CmdOrCtrl+F12': () => {
    BrowserWindow.getFocusedWindow()?.webContents.toggleDevTools()
  }
}