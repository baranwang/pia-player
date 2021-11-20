const { ipcRenderer } = window;
import axios from 'axios';
import { AppDatabase } from './db';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import PQueue from 'p-queue';
const db = new AppDatabase();

const API_PREFIX = 'https://api.aipiaxi.com/';

const ffmpeg = createFFmpeg({
  log: true,
  corePath: new URL('/ffmpeg-core.js', window.location.href).href,
});

const ffmpegQueue = new PQueue({ concurrency: 1 });

export function request<T = any>(
  url: string,
  params: Record<string, any> = {}
): Promise<T> {
  return ipcRenderer.invoke('request', { url, params });
}

export const getConfig = async () => {
  const { data } = await request<Aipiaxi.APIResponse<Aipiaxi.Config>>(
    API_PREFIX + 'article/v1/config'
  );
  return data;
};

export const getDrama = async (id: number) => {
  const { data } = await request<Aipiaxi.APIResponse<Aipiaxi.DramaInfo>>(
    API_PREFIX + `article/v1/web/${id}/detail`
  );
  db.drama.put(data);
  return data;
};

export const searchDrama = async ({ page = 1, pageSize = 20, q = '' } = {}) => {
  try {
    const { data } = await request<
      Aipiaxi.APIResponse<{
        count: number;
        page: number;
        page_size: number;
        list: Aipiaxi.DramaInfoInSearch[];
      }>
    >(API_PREFIX + 'discover/article/search', {
      page,
      page_size: pageSize,
      q,
    });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const downloadBGM = async (
  bgm: Aipiaxi.DramaInfo['bgm'][number],
  onProgress?: (options: { ratio: number }) => void
) => {
  const data = await db.bgm.get(bgm.hash);
  if (data && data.filepath) {
    const isExists = await ipcRenderer.invoke('checkFile', data.filepath);
    if (isExists) {
      onProgress?.({ ratio: 1 });
      return data;
    }
  }
  const { headers } = await axios.head(bgm.url);
  const contentType = headers['Content-Type'] || headers['content-type'];
  const transcode = new Audio().canPlayType(contentType) !== 'probably';
  return axios
    .get<Blob>(bgm.url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        const ratio = progressEvent.loaded / progressEvent.total;
        console.log('[下载]', bgm.name, ratio);
        onProgress?.({
          ratio: ratio / (transcode ? 2 : 1),
        });
      },
    })
    .then(async (response) => {
      const name = new URL(bgm.url).pathname.split('/').pop()!;
      let arrayBuffer = await response.data.arrayBuffer();

      // 无法确定可以播放的文件类型，需要转码
      if (transcode) {
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
        await ffmpegQueue.add(async () => {
          ffmpeg.setProgress((progress) => {
            console.log('[转码]', bgm.name, progress.ratio);
            onProgress?.({ ratio: progress.ratio / 2 + 0.5 });
          });
          ffmpeg.FS(
            'writeFile',
            name,
            new Uint8Array(await response.data.arrayBuffer())
          );
          await ffmpeg.run('-i', name, '-c:a', 'aac', '-vn', `${bgm.hash}.m4a`);
          arrayBuffer = ffmpeg.FS('readFile', `${bgm.hash}.m4a`).buffer;
          ffmpeg.FS('unlink', name);
          ffmpeg.FS('unlink', `${bgm.hash}.m4a`);
        });
      }

      const filepath: string = await ipcRenderer.invoke('saveFile', {
        arrayBuffer,
        filename: bgm.hash,
      });

      const res = { ...bgm, filepath };
      db.bgm.put(res);
      return res;
    });
};

export const viewDrama = (id: number, title: string) => {
  return ipcRenderer.send('view', { id, title });
};
