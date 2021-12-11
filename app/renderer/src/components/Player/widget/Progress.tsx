import * as React from 'react';
import { Slider } from 'antd';
import { timeFormatter } from '../utils';

import styles from '../player.module.less';

export const PlayerProgress: React.FC<{
  duration: number;
  currentTime: number;
  playStatus: boolean;
  onProgressChange: (currentTime: number) => void;
  onPlay: () => void;
  onPause: () => void;
}> = ({ duration, currentTime, playStatus, onProgressChange, onPlay, onPause }) => {
  const [beforeChangeTimePlayStutas, saveBeforeChangeTimePlayStutas] = React.useState<
    boolean | null
  >(null);

  return (
    <div className={styles['player-progress']}>
      <time>{timeFormatter(currentTime)}</time>
      <Slider
        step={0.0001}
        max={duration}
        value={currentTime}
        tipFormatter={timeFormatter}
        onChange={(value: number) => {
          if (beforeChangeTimePlayStutas === null) {
            saveBeforeChangeTimePlayStutas(playStatus);
          }
          onPause();
          onProgressChange(value);
        }}
        onAfterChange={() => {
          if (beforeChangeTimePlayStutas) {
            onPlay();
          }
          saveBeforeChangeTimePlayStutas(null);
        }}
      />
      <time>{timeFormatter(duration)}</time>
    </div>
  );
};
