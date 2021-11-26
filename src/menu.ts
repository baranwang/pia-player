import { app, shell } from 'electron';
import { accelerator } from './accelerator';
import { productName } from '../package.json';

const name = app?.name || productName;

export const createMenu = (
  options: {
    togglePlay?: () => void;
    volumeUp?: () => void;
    volumeDown?: () => void;
  } = {}
): Menus => [
  ...((process.platform === 'darwin'
    ? [
        {
          label: name,
          submenu: [
            { role: 'about', label: `关于 ${name}` },
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
    : []) as Menus),
  {
    label: '控制',
    submenu: [
      {
        label: '播放/暂停',
        accelerator: 'Space',
        click: () => {
          options.togglePlay?.();
        },
      },
      { type: 'separator' },
      {
        label: '音量+',
        accelerator: 'up',
        click: () => {
          options.volumeUp?.();
        },
      },
      {
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
          shell.openExternal('https://github.com/baranwang/pia-player/issues');
        },
      },
      { type: 'separator' },
    ],
  },
];
