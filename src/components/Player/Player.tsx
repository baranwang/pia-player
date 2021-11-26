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
import { AudioPlayer } from './audio';

const donwloadQueue = new PQueue({ concurrency: 3 });

const audioPlayer = new AudioPlayer();
const AudioPlayerCtx = React.createContext(audioPlayer);

export const Player: React.FC = observer(() => {
  return (
    <AudioPlayerCtx.Provider value={audioPlayer}>
      <PlayerView />
    </AudioPlayerCtx.Provider>
  );
});

const PlayerView: React.FC<React.HTMLAttributes<HTMLElement>> = observer(() => {
  const { playlistStore } = useStores();

  const audio = React.useContext(AudioPlayerCtx);

  const [progressMap, { set: setProgress }] = useMap<string, number>();

  const progress = React.useMemo(
    () => Object.fromEntries(progressMap),
    [progressMap]
  );

  React.useEffect(() => {
    const list = playlistStore.playlist || [];
    audio.playlist = list.map((item) => ({ ...item, filepath: item.url }));
    audio.playIndex = 0;
    playlistStore.playlist?.forEach(async (item, index) => {
      const data = await donwloadQueue.add(async () => {
        const { filepath } = await downloadBGM(item, (options) => {
          setProgress(item.hash, options.ratio);
        });
        return { ...item, filepath };
      });
      audio.playlist[index] = data;
    });
  }, [playlistStore.playlist]);

  const activeDrama = React.useMemo(
    () => playlistStore.activeDrama || null,
    [playlistStore.activeDrama]
  );

  const bgm = React.useMemo(() => audio.current, [audio]);

  // const prevBgm = usePrevious(bgm, (prev, next) => {
  //   return prev?.filepath !== next?.filepath;
  // });

  const [activeDevice, setActiveDevice] = useLocalStorageState<
    MediaDeviceInfo['deviceId'] | null
  >('activeDevice', null);

  React.useEffect(() => {
    if (activeDevice) {
      (audio as any).setSinkId(activeDevice);
    }
  }, [activeDevice]);

  const [playbackRate, setPlaybackRate] = React.useState(1);

  React.useEffect(() => {
    window.ipcRenderer.on(EK.togglePlay, () => {
      audio.isPlaying ? audio.pause() : audio.play();
    });
    window.ipcRenderer.on(EK.volumeUp, () => {
      audio.setVolume((value) => Math.min(1, (value || 0) + 0.1));
    });
    window.ipcRenderer.on(EK.volumeDown, () => {
      audio.setVolume((value) => Math.max(0, (value || 0) - 0.1));
    });

    return () => {
      audio.playlist = [];
    };
  }, []);

  React.useEffect(() => {
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  // React.useEffect(() => {
  //   if (!bgm || !bgm.filepath) return;
  //   let time = 0;
  //   if (prevBgm?.hash === bgm.hash) {
  //     time = audio.currentTime;
  //   }
  //   audio.src = bgm.filepath;
  //   audio.currentTime = time;
  //   play();

  //   navigator.mediaSession.metadata = new MediaMetadata({
  //     title: bgm.name,
  //     artist: activeDrama?.nickname,
  //     artwork: [{ src: activeDrama?.photo || '' }],
  //   });
  // }, [bgm]);

  // useKeyPress(' ', togglePlay, { events: ['keyup'] });
  // useKeyPress('ArrowLeft', seekbackward);
  // useKeyPress('ArrowRight', seekforward);
  // useKeyPress('PageUp', previousTrack);
  // useKeyPress('PageDown', nextTrack);
  // useKeyPress('ArrowUp', () => {
  //   setVolume((value) => Math.min(1, (value || 0) + 0.1));
  // });
  // useKeyPress('ArrowDown', () => {
  //   setVolume((value) => Math.max(0, (value || 0) - 0.1));
  // });

  // if (!audio.playlist || !bgm) return <></>;

  return (
    <div className={styles.player}>
      {JSON.stringify(audio)}
      <PlayerProgress
        duration={audio.duration}
        currentTime={audio.currentTime}
        playStatus={audio.isPlaying}
        onProgressChange={(value) => {
          audio.currentTime = value;
        }}
        onPlay={audio.play}
        onPause={audio.pause}
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
            play={audio.isPlaying}>
            {bgm?.name}
          </Marquee>
        </Space>

        <Space size="middle">
          <Button
            type="text"
            icon={<Icon type="skip_previous" />}
            disabled={audio.playIndex === 0}
            onClick={audio.prev}
          />
          <Button
            type="text"
            icon={<Icon type="fast_rewind" />}
            onClick={audio.seekBackward}
          />
          <Button
            type="text"
            size="large"
            icon={<Icon type={audio.isPlaying ? 'pause' : 'play_arrow'} />}
            onClick={audio.togglePlay}
          />
          <Button
            type="text"
            icon={<Icon type="fast_forward" />}
            onClick={audio.seekForward}
          />
          <Button
            type="text"
            icon={<Icon type="skip_next" />}
            disabled={audio.playIndex === audio.playlist.length - 1}
            onClick={audio.next}
          />
        </Space>

        <Space className={styles['player-actions-right']}>
          <PlayerPlaybackRate value={playbackRate} onChange={setPlaybackRate} />
          <PlayerVolume
            value={audio.volume || 0}
            onVolumeChange={(value) => {
              audio.volume = value;
            }}
            device={activeDevice}
            onDeviceChange={setActiveDevice}
          />

          <PlayerPlaylist
            playlist={audio.playlist}
            index={audio.playIndex}
            progress={progress}
            onChange={(index) => {
              audio.playIndex = index;
            }}
          />
        </Space>
      </div>
    </div>
  );
});
