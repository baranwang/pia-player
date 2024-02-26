// import { Webview } from '@tauri-apps/api/webview';
// import { Window } from '@tauri-apps/api/window';

import { core } from '@tauri-apps/api';

import { IconMore } from '@douyinfe/semi-icons';
import { Dropdown } from '@douyinfe/semi-ui';
import { useRequest } from 'ahooks';

import { usePlayerContext } from '@/hooks/use-player';
import { generateM3uAndOpen } from '@/utils/common';

interface OperateProps {
  articleId: number;
  hasBgm?: boolean;
}

export const Operate: React.FC<OperateProps> = ({ articleId, hasBgm }) => {
  const { addPlaylistById } = usePlayerContext();
  const { run: openWithSystemPlayer } = useRequest(() => generateM3uAndOpen(articleId), {
    manual: true,
  });
  const handleView = () => {
    core.invoke('view_article', { articleId });
  };
  return (
    <Dropdown
      render={
        <Dropdown.Menu>
          <Dropdown.Item onClick={handleView}>查看</Dropdown.Item>
          {hasBgm && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => addPlaylistById(articleId)}>内置播放器</Dropdown.Item>
              <Dropdown.Item onClick={openWithSystemPlayer}>系统播放器</Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      }
    >
      <IconMore />
    </Dropdown>
  );
};
