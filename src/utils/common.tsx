import { path } from '@tauri-apps/api';
import { open as fs, BaseDirectory } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-shell';

import { IconSpin } from '@douyinfe/semi-icons';
import { Toast } from '@douyinfe/semi-ui';

import { api } from '@/api';

export const formatSecond = (second: number | string) => {
  const s = Math.floor(Number(second));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const ss = s % 60;
  const mm = m % 60;
  return `${h > 0 ? `${h}:` : ''}${mm < 10 ? `0${mm}` : mm}:${ss < 10 ? `0${ss}` : ss}`;
};

export const generateM3uAndOpen = async (id: number | string) => {
  const toastId = Toast.info({ content: '正在获取 BGM 信息...', icon: <IconSpin spin />, duration: 0 });
  try {
    const { data } = await api.getDetail(Number(id)).catch(() => {
      throw new Error('获取 BGM 信息失败');
    });
    Toast.info({ id: toastId, content: '正在生成播放列表...', duration: 0 });
    const fileName = `${data.id}.m3u`;
    const file = await fs(fileName, {
      write: true,
      create: true,
      baseDir: BaseDirectory.AppCache,
    });
    const encoder = new TextEncoder();
    const m3u = ['#EXTM3U', '', `#PLAYLIST:${data.name}`, '', `#EXTIMG:${data.photo}`, '', ''];
    data.bgm.forEach(item => {
      m3u.push(`#EXTINF:${item.duration ?? '-1'},${item.name}`, item.url);
    });
    m3u.push('', '#EXT-X-ENDLIST');
    await file.write(encoder.encode(m3u.join('\n')));
    const appCacheDir = await path.appCacheDir();
    const filePath = await path.resolve(appCacheDir, fileName);
    Toast.success({ id: toastId, content: '播放列表已生成', icon: undefined, duration: 3 });
    return open(`file://${filePath}`);
  } catch (error) {
    const e = error as Error;
    Toast.error({ id: toastId, content: e.message, icon: undefined, duration: 3 });
    throw e;
  }
};
