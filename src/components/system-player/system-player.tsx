import { path } from '@tauri-apps/api';
import { open as fs, BaseDirectory } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-shell';

import { Dropdown } from '@douyinfe/semi-ui';
import { useRequest } from 'ahooks';

import { api } from '@/api';

interface SystemPlayerProps {
  detailId: number;
}

export const SystemPlayer: React.FC<SystemPlayerProps> = ({ detailId }) => {
  const { run } = useRequest(() => api.getDetail(detailId).then(res => res.data), {
    manual: true,
    onSuccess: async detail => {
      const fileName = `${detail.id}.m3u`;
      const file = await fs(fileName, {
        write: true,
        create: true,
        baseDir: BaseDirectory.AppCache,
      });
      const encoder = new TextEncoder();
      const m3u = ['#EXTM3U'];
      detail.bgm.forEach(item => {
        m3u.push(`#EXTINF:-1,${item.name}`, item.url);
      });
      await file.write(encoder.encode(m3u.join('\n')));
      const appCacheDir = await path.appCacheDir();
      const filePath = await path.resolve(appCacheDir, fileName);
      console.log(filePath);
      open(`file://${filePath}`);
    },
  });
  return <Dropdown.Item onClick={run}>系统播放器</Dropdown.Item>;
};
