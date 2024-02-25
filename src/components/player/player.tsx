import { useMemo } from 'react';

import { IconPause, IconPlay, IconRestart } from '@douyinfe/semi-icons';
import { Button, Slider } from '@douyinfe/semi-ui';

import { Playlist } from './playlist';
import { Volume } from './volume';
import { usePlayerContext } from '@/hooks/use-player';
import { formatSecond } from '@/utils/common';

import styles from './player.module.scss';

export const Player: React.FC = () => {
  const {
    isPlaying,
    current,
    duration,
    currentTime,
    mediaLoading,
    disablePrev,
    disableNext,
    handleTogglePlay,
    handlePrev,
    handleNext,
    handleSeek,
  } = usePlayerContext();
  const playButtonIcon = useMemo(() => {
    if (isPlaying) {
      return <IconPause />;
    }
    return <IconPlay />;
  }, [isPlaying]);

  return (
    <>
      <div className={styles.player}>
        <Button
          theme="borderless"
          size="large"
          type="tertiary"
          icon={<IconRestart />}
          disabled={disablePrev}
          onClick={handlePrev}
        />
        <Button
          theme="borderless"
          size="large"
          type="tertiary"
          icon={playButtonIcon}
          disabled={!current}
          loading={mediaLoading}
          onClick={handleTogglePlay}
        />
        <Button
          theme="borderless"
          size="large"
          type="tertiary"
          icon={<IconRestart rotate={180} />}
          disabled={disableNext}
          onClick={handleNext}
        />
        <div className={styles['player-content']}>
          <Slider
            key={duration}
            className={styles['player-progress']}
            value={currentTime}
            step={0.0001}
            min={0}
            max={duration}
            tooltipVisible={false}
            marks={
              duration
                ? {
                    [duration]: (
                      <>
                        <span className={styles['player-current-time']}>{formatSecond(currentTime ?? 0)}</span> /{' '}
                        {formatSecond(duration)}
                      </>
                    ) as any,
                  }
                : undefined
            }
            onChange={handleSeek as any}
          />
        </div>
        <Volume />
        <Playlist />
      </div>
    </>
  );
};
