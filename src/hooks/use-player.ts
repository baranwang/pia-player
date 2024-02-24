import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import { useRequest } from 'ahooks';
import { Howl } from 'howler';

import { api } from '@/api';

interface PlaylistItem extends XJ.BGM {
  howl: Howl;
}

export function usePlayer() {
  const [mediaLoading, setMediaLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const [playlist, setPlaylist] = useReducer((state: PlaylistItem[], bgm: XJ.DetailInfo['bgm']) => {
    current?.howl.stop();
    setIsPlaying(false);
    setMediaLoading(true);
    return bgm.map(item => {
      const howl = new Howl({
        src: [item.url],
        html5: true,
        autoplay: false,
        preload: true,
      });
      return {
        ...item,
        howl,
      };
    });
  }, []);

  const [playIndex, setPlayIndex] = useReducer((state: number, index: number) => {
    if (index < 0) {
      return 0;
    }
    if (index >= playlist?.length) {
      return playlist.length - 1;
    }
    return index;
  }, 0);

  const current = useMemo<PlaylistItem | undefined>(() => playlist[playIndex], [playlist, playIndex]);

  const _getDurationAndCurrentTime = () => {
    return { duration: current?.howl.duration(), currentTime: current?.howl.seek() };
  };
  const [durationAndCurrentTime, getDurationAndCurrentTime] = useReducer(
    _getDurationAndCurrentTime,
    _getDurationAndCurrentTime(),
  );

  const { run: addPlaylistById, loading: getDetailLoading } = useRequest(
    (id: number) => api.getDetail(id).then(res => res.data),
    {
      manual: true,
      onSuccess: detail => {
        setPlaylist(detail.bgm);
      },
    },
  );

  const handleLoad = () => {
    setMediaLoading(false);
    getDurationAndCurrentTime();
  };

  const handleProgress = () => {
    getDurationAndCurrentTime();
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

  useEffect(() => {
    current?.howl.on('load', handleLoad);
    current?.howl.on('play', handleOnPlay);
    current?.howl.on('pause', handleOnPause);
    return () => {
      current?.howl.stop();
      current?.howl.off('load', handleLoad);
      current?.howl.off('play', handleOnPlay);
      current?.howl.off('pause', handleOnPause);
    };
  }, [current?.howl]);

  useEffect(() => {
    setPlayIndex(0);
    getDurationAndCurrentTime();
  }, [playlist]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      current?.howl.pause();
    } else {
      current?.howl.play();
    }
  };

  const handleSeek = (value: number) => {
    current?.howl.seek(value);
  };

  const playById = (id: number) => {
    current?.howl.stop();
    const index = playlist.findIndex(item => item.id === id);
    setPlayIndex(index);
    playlist[index].howl.play();
  };

  const disablePrev = useMemo(() => playIndex === 0, [playIndex]);
  const disableNext = useMemo(() => playIndex === playlist.length - 1, [playIndex, playlist]);

  const handlePrev = () => {
    setPlayIndex(playIndex - 1);
    playlist[playIndex - 1].howl.play();
  };

  const handleNext = () => {
    setPlayIndex(playIndex + 1);
    playlist[playIndex + 1].howl.play();
  };

  return {
    ...durationAndCurrentTime,
    playlist,
    current,
    isPlaying,
    getDetailLoading,
    mediaLoading,
    disablePrev,
    disableNext,
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
