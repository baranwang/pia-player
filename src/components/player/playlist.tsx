import { IconList } from '@douyinfe/semi-icons';
import { Button, Dropdown } from '@douyinfe/semi-ui';

import { usePlayerContext } from '@/hooks/use-player';

export const Playlist: React.FC = () => {
  const { playlist, current, getDetailLoading, playById } = usePlayerContext();
  return (
    <Dropdown
      showTick
      render={
        <Dropdown.Menu>
          {playlist.map(item => (
            <Dropdown.Item
              key={item.id}
              active={current?.id === item.id}
              onClick={() => {
                playById(item.id);
              }}
            >
              {item.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      }
    >
      <Button
        theme="borderless"
        size="large"
        type="tertiary"
        icon={<IconList />}
        loading={getDetailLoading}
        disabled={!playlist.length}
      />
    </Dropdown>
  );
};
