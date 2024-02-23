import { Button, Slider } from '@douyinfe/semi-ui';
import { IconPlay } from '@douyinfe/semi-icons';

import styles from './player.module.scss';

export const Player: React.FC = () => {
  console.log('Player');
  return (
    <>
      <div className={styles.player}>
        <Button
          className={styles['player-button']}
          theme="borderless"
          size="large"
          type="tertiary"
          icon={<IconPlay />}
        />
        <div className={styles['player-content']}>
          <Slider showBoundary />
        </div>
      </div>
    </>
  );
};
