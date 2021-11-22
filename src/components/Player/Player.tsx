import React from 'react';
import { observer } from 'mobx-react';
import { downloadBGM } from '@/api';
import { useStores } from '@/store';
import { Button, message, Space } from 'antd';
import { Icon } from '../Icon/Icon';
import { useKeyPress, useLocalStorageState, useMap, usePrevious } from 'ahooks';
import Marquee from 'react-fast-marquee';
import PQueue from 'p-queue';
import { PlayerVolume } from './widget/Volume';
import { PlayerProgress } from './widget/Progress';
import { PlayerPlaybackRate } from './widget/PlaybackRate';
import { PlayerPlaylist } from './widget/Playlist';

import styles from './player.module.less';
import { EK } from '@/eventKeys';

const donwloadQueue = new PQueue({ concurrency: 3 });

export const Player: React.FC<React.HTMLAttributes<HTMLElement>> = observer(
  () => {
    const { playlistStore } = useStores();

    const [playlist, setPlaylist] = React.useState(
      playlistStore.playlist || null
    );

    const [progressMap, { set: setProgress }] = useMap<string, number>();

    const progress = React.useMemo(
      () => Object.fromEntries(progressMap),
      [progressMap]
    );

    React.useEffect(() => {
      const list = playlistStore.playlist || [];
      setPlaylist(list.map((item) => ({ ...item, filepath: item.url })));
      setPlayIndex(0);
      playlistStore.playlist?.forEach(async (item, index) => {
        const data = await donwloadQueue.add(async () => {
          const { filepath } = await downloadBGM(item, (options) => {
            setProgress(item.hash, options.ratio);
          });
          return { ...item, filepath };
        });
        setPlaylist((list) => {
          (list || [])[index] = data;
          return [...list!];
        });
      });
    }, [playlistStore.playlist]);

    const activeDrama = React.useMemo(
      () => playlistStore.activeDrama || null,
      [playlistStore.activeDrama]
    );

    const [playIndex, setPlayIndex] = React.useState(0);

    const [playStatus, setPlayStatus] = React.useState(false);

    const bgm = React.useMemo(() => {
      if (!playlist) {
        return null;
      }
      return playlist[playIndex] as BGM;
    }, [playlist, playIndex]);

    const prevBgm = usePrevious(bgm, (prev, next) => {
      return prev?.filepath !== next?.filepath;
    });

    const [activeDevice, setActiveDevice] = useLocalStorageState<
      MediaDeviceInfo['deviceId'] | null
    >('activeDevice', null);

    React.useEffect(() => {
      if (activeDevice) {
        (audio as any).setSinkId(activeDevice);
      }
    }, [activeDevice]);

    const [audio] = React.useState(new Audio());
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [volume, setVolume] = useLocalStorageState<number | null>(
      'volume',
      null
    );
    const [playbackRate, setPlaybackRate] = React.useState(1);

    const play = React.useCallback(() => {
      audio.play().catch((e: Error) => {
        if (e.name === 'NotSupportedError') {
          message.warning('该音频文件不支持在线播放，正在等待缓存解码');
        }
      });
    }, [audio]);

    const pause = React.useCallback(() => {
      audio.pause();
    }, [audio]);

    const togglePlay = React.useCallback(() => {
      if (!bgm) return;
      playStatus ? pause() : play();
    }, [bgm, playStatus, play, pause]);

    const seekbackward = React.useCallback(() => {
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    }, [audio]);

    const seekforward = React.useCallback(() => {
      audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
    }, [audio]);

    const previousTrack = React.useCallback(() => {
      if (playIndex === 0) {
        return;
      }
      setPlayIndex(playIndex - 1);
    }, [playIndex]);

    const nextTrack = React.useCallback(() => {
      if (playlist && playIndex < playlist.length - 1) {
        setPlayIndex(playIndex + 1);
      }
    }, [playlist, playIndex]);

    const handlePlaying = React.useCallback(() => {
      if (!playStatus) {
        setPlayStatus(true);
      }
    }, [playStatus]);

    const handlePause = React.useCallback(() => {
      setPlayStatus(false);
    }, [playStatus]);

    const handleDurationChange = React.useCallback(() => {
      setDuration(audio.duration);
    }, [audio]);

    const handleCurrentTimeChange = React.useCallback(() => {
      setCurrentTime(audio.currentTime);
    }, [audio]);

    const handleVolumeChange = React.useCallback(() => {
      setVolume(audio.volume);
    }, [audio]);

    React.useEffect(() => {
      window.ipcRenderer.on(EK.togglePlay, () => {
        audio.paused ? audio.play() : audio.pause();
      });
      window.ipcRenderer.on(EK.volumeUp, () => {
        setVolume((value) => Math.min(1, (value || 0) + 0.1));
      });
      window.ipcRenderer.on(EK.volumeDown, () => {
        setVolume((value) => Math.max(0, (value || 0) - 0.1));
      });

      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('timeupdate', handleCurrentTimeChange);
      audio.addEventListener('volumechange', handleVolumeChange);
      audio.addEventListener('ended', nextTrack);

      navigator.mediaSession.setActionHandler('seekbackward', seekbackward);
      navigator.mediaSession.setActionHandler('seekforward', seekforward);
      navigator.mediaSession.setActionHandler('previoustrack', previousTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);

      return () => {
        audio.src = '';
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('timeupdate', handleCurrentTimeChange);
        audio.removeEventListener('volumechange', handleVolumeChange);
        audio.removeEventListener('ended', nextTrack);
      };
    }, []);

    React.useEffect(() => {
      audio.volume = volume ?? 1;
    }, [volume]);

    React.useEffect(() => {
      audio.playbackRate = playbackRate;
    }, [playbackRate]);

    React.useEffect(() => {
      if (!bgm || !bgm.filepath) return;
      let time = 0;
      if (prevBgm?.hash === bgm.hash) {
        time = audio.currentTime;
      }
      audio.src = bgm.filepath;
      audio.currentTime = time;
      play();

      navigator.mediaSession.metadata = new MediaMetadata({
        title: bgm.name,
        artist: activeDrama?.nickname,
        artwork: [{ src: activeDrama?.photo || '' }],
      });
    }, [bgm]);

    // useKeyPress(' ', togglePlay, { events: ['keyup'] });
    useKeyPress('ArrowLeft', seekbackward);
    useKeyPress('ArrowRight', seekforward);
    useKeyPress('PageUp', previousTrack);
    useKeyPress('PageDown', nextTrack);
    // useKeyPress('ArrowUp', () => {
    //   setVolume((value) => Math.min(1, (value || 0) + 0.1));
    // });
    // useKeyPress('ArrowDown', () => {
    //   setVolume((value) => Math.max(0, (value || 0) - 0.1));
    // });

    if (!playlist || !bgm) return <></>;

    return (
      <div className={styles.player}>
        <PlayerProgress
          duration={duration}
          currentTime={currentTime}
          playStatus={playStatus}
          onProgressChange={(value) => {
            setCurrentTime(value);
            audio.currentTime = value;
          }}
          onPlay={play}
          onPause={pause}
        />
        <div className={styles['player-actions']}>
          <Space className={styles['player-meta']}>
            <img
              className={styles['player-meta-cover']}
              src={activeDrama?.photo || require('./default-cover.png')}
            />
            <Marquee
              className={styles['player-meta-title']}
              gradientWidth={40}
              gradientColor={
                (JSON.parse(styles.white) as string)
                  .split(',')
                  .map((v) => +v) as any
              }
              play={playStatus}>
              {bgm?.name}
            </Marquee>
          </Space>

          <Space size="middle">
            <Button
              type="text"
              icon={<Icon type="skip_previous" />}
              disabled={playIndex === 0}
              onClick={previousTrack}
            />
            <Button
              type="text"
              icon={<Icon type="fast_rewind" />}
              onClick={seekbackward}
            />
            <Button
              type="text"
              size="large"
              icon={<Icon type={playStatus ? 'pause' : 'play_arrow'} />}
              onClick={togglePlay}
            />
            <Button
              type="text"
              icon={<Icon type="fast_forward" />}
              onClick={seekforward}
            />
            <Button
              type="text"
              icon={<Icon type="skip_next" />}
              disabled={playIndex === playlist.length - 1}
              onClick={nextTrack}
            />
          </Space>

          <Space className={styles['player-actions-right']}>
            <PlayerPlaybackRate
              value={playbackRate}
              onChange={setPlaybackRate}
            />
            <PlayerVolume
              value={volume || 0}
              onVolumeChange={(value) => {
                audio.volume = value;
              }}
              device={activeDevice}
              onDeviceChange={setActiveDevice}
            />

            <PlayerPlaylist
              playlist={playlist}
              index={playIndex}
              progress={progress}
              onChange={setPlayIndex}
            />
          </Space>
        </div>
      </div>
    );
  }
);
