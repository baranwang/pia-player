const { ipcRenderer } = window;
import { AppDatabase } from './db';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import PQueue from 'p-queue';
import { EK } from '/@eventKeys';
import ffmpegCore from '@ffmpeg/core/dist/ffmpeg-core.js?url';

const db = new AppDatabase();

const API_PREFIX = 'https://api.aipiaxi.com/';

const ffmpeg = createFFmpeg({
  log: true,
  corePath: ffmpegCore,
  logger: ({ type, message }) => {
    window.log.info(`[ffmpeg] ${type}: ${message}`);
  },
});

const ffmpegQueue = new PQueue({ concurrency: 1 });

export const getConfig = async () => {
  const { data } = await fetch(`${API_PREFIX}article/v1/config`).then(
    (res) => res.json() as Promise<Aipiaxi.APIResponse<Aipiaxi.Config>>
  );
  return data;
};

export const getDrama = async (id: number) => {
  const { data } = await fetch(`${API_PREFIX}article/v1/web/${id}/detail`).then(
    (res) => res.json() as Promise<Aipiaxi.APIResponse<Aipiaxi.DramaInfo>>
  );
  db.drama.put(data);
  return data;
};

export const searchDrama = async ({ page = 1, pageSize = 20, q = '' } = {}) => {
  const url = new URL('discover/article/search', API_PREFIX);
  url.search = new URLSearchParams({
    page: `${page}`,
    page_size: `${pageSize}`,
    q,
  }).toString();
  const { data } = await fetch(url.toString()).then(
    (res) =>
      res.json() as Promise<
        Aipiaxi.APIResponse<{
          count: number;
          page: number;
          page_size: number;
          list: Aipiaxi.DramaInfoInSearch[];
        }>
      >
  );
  return data;
};

export const downloadBGM = async (
  bgm: Aipiaxi.DramaInfo['bgm'][number],
  onProgress?: (options: { ratio: number }) => void
) => {
  const data = await db.bgm.get(bgm.hash);
  try {
    const regexp = new RegExp('^stream://');
    if (data && data.filepath && regexp.test(data.filepath)) {
      const pathname = decodeURIComponent(data.filepath.replace(regexp, ''));
      const isExists = await ipcRenderer.invoke(EK.checkFile, pathname);
      if (isExists) {
        onProgress?.({ ratio: 1 });
        return data;
      }
    }
  } catch (error) {
    // do nothing
  }

  let transcode = false;

  const response = await fetch(bgm.url).then(({ headers, body }) => {
    const contentLength = headers.get('Content-Length') || '';
    const total = parseInt(contentLength, 10);

    const contentType = headers.get('Content-Type');
    transcode = new Audio().canPlayType(contentType || '') !== 'probably';

    const reader = body!.getReader();
    let loaded = 0;
    const stream = new ReadableStream({
      start(controller) {
        (async function pump() {
          const { done, value } = await reader.read();
          if (value) {
            loaded += value.length;
            const ratio = loaded / total;
            onProgress?.({ ratio: ratio / (transcode ? 2 : 1) });
            window.log.info('[下载]', bgm.name, ratio);
          }
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          await pump();
        })();
      },
    });
    return new Response(stream, { headers });
  });

  const name = new URL(bgm.url).pathname.split('/').pop()!;
  let arrayBuffer = await response.arrayBuffer();

  // 无法确定可以播放的文件类型，需要转码
  if (transcode) {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
    await ffmpegQueue.add(async () => {
      ffmpeg.setProgress((progress) => {
        window.log.info('[转码]', bgm.name, progress.ratio);
        onProgress?.({ ratio: progress.ratio / 2 + 0.5 });
      });
      ffmpeg.FS('writeFile', name, new Uint8Array(arrayBuffer));
      await ffmpeg.run('-i', name, '-c:a', 'aac', '-vn', `${bgm.hash}.aac`);
      arrayBuffer = ffmpeg.FS('readFile', `${bgm.hash}.aac`).buffer;
      ffmpeg.FS('unlink', name);
      ffmpeg.FS('unlink', `${bgm.hash}.aac`);
    });
  }
  const filepath = await ipcRenderer.invoke(EK.saveFile, {
    arrayBuffer,
    filename: bgm.hash,
  });
  const res = {
    ...bgm,
    filepath: `stream://${encodeURIComponent(filepath)}`,
  };
  db.bgm.put(res);
  return res;
};

export const viewDrama = (id: number, title: string) => {
  return ipcRenderer.send(EK.view, { id, title });
};
