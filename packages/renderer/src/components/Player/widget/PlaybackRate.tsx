import * as React from 'react';
import { Button, Dropdown, Menu, Slider } from 'antd';

import styles from '../player.module.less';

export const PlayerPlaybackRate: React.FC<{
  value: number;
  onChange: (backRate: number) => void;
}> = ({ value, onChange }) => {
  return (
    <Dropdown
      trigger={['click']}
      arrow
      overlay={
        <Menu>
          <div className={styles['player-actions-playbackrate-slider']}>
            <Slider
              value={value}
              min={0.25}
              max={5}
              step={0.01}
              marks={{
                0.25: 0.25,
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
              }}
              onChange={onChange}
            />
          </div>
        </Menu>
      }>
      <Button type="text">{value}倍速</Button>
    </Dropdown>
  );
};
