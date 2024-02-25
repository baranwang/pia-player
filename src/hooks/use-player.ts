import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import { Notification } from '@douyinfe/semi-ui';
import { useDebounce, useLocalStorageState, useRequest } from 'ahooks';
import { Howl } from 'howler';

import { useMediaDevices } from './use-media-devices';
import { api } from '@/api';

import type { HowlErrorCallback } from 'howler';

interface PlaylistItem extends XJ.BGM {
  howl: Howl;
}

export function usePlayer() {
  const { mediaDevices } = useMediaDevices();
  const outputDevices = useMemo(
    () => mediaDevices.audiooutput?.filter(device => device.deviceId !== 'default'),
    [mediaDevices],
  );
  const [outputDeviceId, setOutputDeviceId] = useLocalStorageState('outputDeviceId', {
    defaultValue: outputDevices?.[0]?.deviceId,
  });
  useEffect(() => {
    if (!outputDeviceId && outputDevices?.length > 0) {
      setOutputDeviceId(outputDevices[0].deviceId);
    }
  }, [outputDevices, outputDeviceId]);

  const setMediaSinkId = (howl: Howl) => {
    (howl as any)._sounds.forEach((sound: any) => {
      sound._node.setSinkId(outputDeviceId);
    });
  };

  const [mediaLoading, setMediaLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const [playlist, setPlaylist] = useReducer((state: PlaylistItem[], bgm: XJ.DetailInfo['bgm']) => {
    state.forEach(item => item.howl.stop());
    setIsPlaying(false);
    setMediaLoading(true);
    return bgm.map(item => {
      const howl = new Howl({
        src: item.url,
        html5: true,
        autoplay: false,
        preload: true,
      });
      setMediaSinkId(howl);
      return { ...item, howl };
    });
  }, []);

  useEffect(() => {
    playlist.forEach(item => {
      setMediaSinkId(item.howl);
    });
  }, [playlist, outputDeviceId]);

  const [playIndex, setPlayIndex] = useReducer((state: number, index: number) => {
    return Math.max(0, Math.min(index, playlist.length - 1));
  }, 0);

  const current = useMemo<PlaylistItem | undefined>(() => playlist[playIndex], [playlist, playIndex]);

  const getMediaTimeData = () => ({ duration: current?.howl.duration(), currentTime: current?.howl.seek() });
  const [mediaTimeData, fetchMediaTimeData] = useReducer(getMediaTimeData, getMediaTimeData());

  const {
    data: articleDetail,
    run: addPlaylistById,
    loading: getDetailLoading,
  } = useRequest((id: number) => api.getDetail(id).then(res => res.data), {
    manual: true,
    onSuccess: detail => {
      setPlaylist(detail.bgm);
    },
  });

  const handleLoad = () => {
    setMediaLoading(false);
    fetchMediaTimeData();
  };

  const handleLoadError: HowlErrorCallback = (_, error) => {
    setMediaLoading(false);
    Notification.error({ title: '音频加载失败', content: error });
  };

  const handleProgress = () => {
    fetchMediaTimeData();
    if (current?.howl.playing()) {
      requestAnimationFrame(handleProgress);
    }
  };

  const handleOnPlay = () => {
    requestAnimationFrame(handleProgress);
    setIsPlaying(true);
  };
  const handleOnPause = () => {
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      current?.howl.pause();
    } else {
      current?.howl.play();
    }
  };

  useEffect(() => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current?.name,
      artist: articleDetail?.name,
      artwork: [{ src: articleDetail?.photo ?? '' }],
    });
    navigator.mediaSession.setActionHandler('play', () => current?.howl.play());
    navigator.mediaSession.setActionHandler('pause', () => current?.howl.pause());
    current?.howl.on('load', handleLoad);
    current?.howl.on('play', handleOnPlay);
    current?.howl.on('pause', handleOnPause);
    current?.howl.on('loaderror', handleLoadError);
    return () => {
      current?.howl.stop();
      current?.howl.off('load', handleLoad);
      current?.howl.off('play', handleOnPlay);
      current?.howl.off('pause', handleOnPause);
    };
  }, [current, articleDetail]);

  useEffect(() => {
    setPlayIndex(0);
    fetchMediaTimeData();
  }, [playlist]);

  const isPlayingDebounce = useDebounce(isPlaying);

  const handleSeek = (value: number) => {
    current?.howl.pause();
    current?.howl.seek(value);
    if (isPlayingDebounce) {
      current?.howl?.play();
    }
    fetchMediaTimeData();
  };

  navigator.mediaSession.setActionHandler('seekto', event => {
    if (event.seekTime) {
      handleSeek(event.seekTime);
    }
  });
  const handleMediaSessionSeek: MediaSessionActionHandler = event => {
    const skipTime = 5;
    const { currentTime = 0, duration = 0 } = getMediaTimeData();
    switch (event.action) {
      case 'seekforward':
        handleSeek(Math.min(currentTime + skipTime, duration));
        break;
      case 'seekbackward':
        handleSeek(Math.max(currentTime - skipTime, 0));
        break;
      default:
        break;
    }
  };
  navigator.mediaSession.setActionHandler('seekforward', handleMediaSessionSeek);
  navigator.mediaSession.setActionHandler('seekbackward', handleMediaSessionSeek);

  const playById = (id: number) => {
    current?.howl.stop();
    const index = playlist.findIndex(item => item.id === id);
    setPlayIndex(index);
    playlist[index].howl.play();
  };

  const disablePrev = playIndex === 0;
  const disableNext = playIndex >= playlist.length - 1;

  const handlePrev = () => {
    setPlayIndex(playIndex - 1);
    playlist[playIndex - 1].howl.play();
  };

  const handleNext = () => {
    setPlayIndex(playIndex + 1);
    playlist[playIndex + 1].howl.play();
  };

  useEffect(() => {
    navigator.mediaSession.setActionHandler('previoustrack', disablePrev ? null : handlePrev);
    navigator.mediaSession.setActionHandler('nexttrack', disableNext ? null : handleNext);
  }, [disablePrev, disableNext]);

  return {
    ...mediaTimeData,
    outputDevices,
    outputDeviceId,
    playlist,
    current,
    isPlaying,
    getDetailLoading,
    mediaLoading,
    disablePrev,
    disableNext,
    setOutputDeviceId,
    handleTogglePlay,
    handlePrev,
    handleNext,
    handleSeek,
    addPlaylistById,
    playById,
  };
}

type PlayerContextType = ReturnType<typeof usePlayer>;

export const PlayerContext = createContext<PlayerContextType>({
  isPlaying: false,
} as PlayerContextType);

export function usePlayerContext() {
  return useContext(PlayerContext);
}
