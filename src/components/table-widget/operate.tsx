import { IconMore } from '@douyinfe/semi-icons';
import { Dropdown } from '@douyinfe/semi-ui';

import { SystemPlayer } from '../system-player';
import { usePlayerContext } from '@/hooks/use-player';

interface OperateProps {
  articleId: number;
  hasBgm?: boolean;
}

export const Operate: React.FC<OperateProps> = ({ articleId, hasBgm }) => {
  const { addPlaylistById } = usePlayerContext();
  return (
    <Dropdown
      render={
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => open(`https://aipiaxi.com/article-detail/${articleId}`)}>查看</Dropdown.Item>
          {hasBgm && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => {
                  addPlaylistById(articleId);
                }}
              >
                内置播放器
              </Dropdown.Item>
              <SystemPlayer detailId={articleId} />
            </>
          )}
        </Dropdown.Menu>
      }
    >
      <IconMore />
    </Dropdown>
  );
};
