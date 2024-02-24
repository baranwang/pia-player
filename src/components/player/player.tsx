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

  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }
    return ((currentTime ?? 0) / duration) * 100;
  }, [currentTime, duration]);

  const handleProgressChange = (value: number) => {
    const seek = (duration ?? 0) * (value / 100);
    handleSeek(seek);
  };

  const handleProgressTipFormatter = (value: number) => {
    return formatSecond((duration ?? 0) * (value / 100));
  };

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
            className={styles['player-progress']}
            value={progress}
            step={0.0001}
            tipFormatter={handleProgressTipFormatter as any}
            marks={
              duration
                ? {
                    100: (
                      <>
                        <span className={styles['player-current-time']}>{formatSecond(currentTime ?? 0)}</span> /{' '}
                        {formatSecond(duration)}
                      </>
                    ) as any,
                  }
                : undefined
            }
            onChange={handleProgressChange as any}
          />
        </div>
        <Volume />
        <Playlist />
      </div>
    </>
  );
};
