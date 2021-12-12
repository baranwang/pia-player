import { app, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import { accelerator } from './accelerator';
import { productName } from '../../../package.json';

const isDevelopment = import.meta.env.MODE === 'development';

const name = app?.name || productName;

export const createMenu = (
  options: {
    togglePlay?: () => void;
    volumeUp?: () => void;
    volumeDown?: () => void;
    seekForward?: () => void;
    seekBackward?: () => void;
    nextTrack?: () => void;
    prevTrack?: () => void;
  } = {},
): Array<Electron.MenuItemConstructorOptions | Electron.MenuItem> => [
  ...((process.platform === 'darwin'
    ? [
        {
          label: name,
          submenu: [
            { role: 'about', label: `关于 ${name}` },
            {
              label: '检查更新…',
              click: () =>
                isDevelopment
                  ? autoUpdater.checkForUpdates()
                  : autoUpdater.checkForUpdatesAndNotify(),
            },
            { type: 'separator' },
            // { label: 'Preferences', accelerator: 'CmdOrCtrl+,' },
            // { type: 'separator' },
            { role: 'hide', label: `隐藏 ${name}` },
            { role: 'hideOthers', label: `隐藏其他` },
            { role: 'unhide', label: `全部显示` },
            { type: 'separator' },
            { role: 'quit', label: `退出 ${name}` },
          ],
        },
      ]
    : []) as Array<Electron.MenuItemConstructorOptions | Electron.MenuItem>),
  {
    label: '控制',
    submenu: [
      {
        id: 'togglePlay',
        label: '播放/暂停',
        accelerator: 'Space',
        click: () => {
          options.togglePlay?.();
        },
      },
      {
        id: '_togglePlay',
        label: '播放/暂停（媒体键）',
        accelerator: 'MediaPlayPause',
        visible: false,
        click: () => {
          options.togglePlay?.();
        },
      },
      { type: 'separator' },
      {
        id: 'seekForward',
        label: '快进',
        accelerator: 'right',
        click: () => {
          options.seekForward?.();
        },
      },
      {
        id: 'seekBackward',
        label: '快退',
        accelerator: 'left',
        click: () => {
          options.seekBackward?.();
        },
      },
      {
        id: 'prevTrack',
        label: '上一首',
        accelerator: 'CmdOrCtrl+left',
        click: () => {
          options.prevTrack?.();
        },
      },
      {
        id: 'nextTrack',
        label: '下一首',
        accelerator: 'CmdOrCtrl+right',
        click: () => {
          options.nextTrack?.();
        },
      },
      {
        id: '_prevTrack',
        label: '上一首（媒体键）',
        visible: false,
        accelerator: 'MediaPreviousTrack',
        click: () => {
          options.prevTrack?.();
        },
      },
      {
        id: '_nextTrack',
        label: '下一首（媒体键）',
        visible: false,
        accelerator: 'MediaNextTrack',
        click: () => {
          options.nextTrack?.();
        },
      },
      { type: 'separator' },
      {
        id: 'volumeUp',
        label: '音量+',
        accelerator: 'up',
        click: () => {
          options.volumeUp?.();
        },
      },
      {
        id: 'volumeDown',
        label: '音量-',
        accelerator: 'down',
        click: () => {
          options.volumeDown?.();
        },
      },
      { type: 'separator' },
      {
        label: '重新载入页面',
        accelerator: 'CmdOrCtrl+r',
        click: accelerator['CmdOrCtrl+r'],
      },
    ],
  },
  {
    label: '窗口',
    submenu: [
      { role: 'minimize', label: `最小化 ${name}` },
      { role: 'zoom', label: `最大化 ${name}` },
    ],
  },
  {
    label: '帮助',
    submenu: [
      {
        role: 'help',
        label: `报告问题`,
        click: () => {
          shell.openExternal('https://github.com/pia-player/pia-player/issues');
        },
      },
      { type: 'separator' },
      ...(process.platform !== 'darwin'
        ? [
            {
              label: '检查更新…',
              click: () =>
                isDevelopment
                  ? autoUpdater.checkForUpdates()
                  : autoUpdater.checkForUpdatesAndNotify(),
            },
          ]
        : []),
    ],
  },
];
