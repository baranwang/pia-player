import * as React from 'react';
import { Button, Dropdown, Menu, Progress } from 'antd';
import { Icon } from '/@/components/Icon';

import styles from '../player.module.less';

export const PlayerPlaylist: React.FC<{
  playlist: BGM[];
  index: number;
  progress: Record<string, number>;
  onChange: (index: number) => void;
}> = ({ playlist, index, progress, onChange }) => {
  return (
    <Dropdown
      trigger={['click']}
      arrow
      overlay={
        <Menu
          selectedKeys={[`${index}`]}
          onClick={(info) => {
            info.key && onChange(parseInt(info.key));
          }}
        >
          <Menu.ItemGroup className={styles['player-queue']} title="播放列表">
            {playlist.map((item, index) => (
              <Menu.Item key={index}>
                <div className={styles['player-queue-item']}>
                  <span className={styles['player-queue-item-text']}>{item.name}</span>
                  {!!progress[item.hash] && (
                    <Progress
                      className={styles['player-queue-item-progress']}
                      type="circle"
                      percent={progress[item.hash] * 100}
                      width={16}
                      format={(percent) => ((percent || 0) < 100 ? '' : <Icon type="done" />)}
                    />
                  )}
                </div>
              </Menu.Item>
            ))}
          </Menu.ItemGroup>
        </Menu>
      }
    >
      <Button type="text" icon={<Icon type="queue_music" />} />
    </Dropdown>
  );
};
