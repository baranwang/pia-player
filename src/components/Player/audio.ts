import { useLocalStorageState, usePrevious } from 'ahooks';
import React from 'react';

export const useAudio = ({ onError }: {
  onError?: (e: Error) => void;
} = {}) => {
  const [audio] = React.useState(
    <HTMLAudioElement & { setSinkId(deviceId: string): void }>new Audio()
  );

  const [playlist, setPlaylist] = React.useState<
    {
      key: string;
      src: string;
    }[]
  >([]);

  const [playIndex, setPlayIndex] = React.useState(0);

  React.useEffect(() => {
    if (playlist.length > 0) {
      if (playIndex < 0) {
        setPlayIndex(0);
      }
      if (playIndex >= playlist.length) {
        setPlayIndex(playlist.length - 1);
      }
    }
  }, [playlist, playIndex]);

  const current = React.useMemo(
    () => playlist[playIndex],
    [playlist, playIndex]
  );

  const prevAudio = usePrevious(current, (prev, next) => {
    return prev?.src !== next?.src;
  })

  const disabledNext = React.useMemo(() => {
    return playIndex === playlist.length - 1;
  }, [playIndex, playlist]);

  const disabledPrev = React.useMemo(() => {
    return playIndex === 0;
  }, [playIndex]);

  React.useEffect(() => {
    if (current) {
      let time = 0;
      if (prevAudio?.key === current.key) {
        time = audio.currentTime;
      }
      audio.src = current.src;
      audio.currentTime = time;
      play();
    }
  }, [current]);

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = useLocalStorageState('volume', audio.volume);
  const [duration, setDuration] = React.useState(audio.duration);
  const [currentTime, setCurrentTime] = React.useState(audio.currentTime);

  const play = React.useCallback(() => {
    return audio.play().catch((e: Error) => onError?.(e));
  }, [audio])

  const pause = React.useCallback(() => {
    audio.pause();
  }, [audio])

  const togglePlay = React.useCallback(() => {
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  }, [audio]);

  const next = React.useCallback(() => {
    if (playIndex < playlist.length - 1) {
      setPlayIndex(playIndex + 1);
    }
  }, [playlist, playIndex]);

  const prev = React.useCallback(() => {
    if (playIndex > 0) {
      setPlayIndex(playIndex - 1);
    }
  }, [playlist, playIndex]);

  const seekBackward = React.useCallback(() => {
    audio.currentTime = Math.max(0, audio.currentTime - 5);
  }, [audio]);

  const seekForward = React.useCallback(() => {
    audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
  }, [audio]);

  const handlerTimeUpdate = React.useCallback(() => {
    setCurrentTime(audio.currentTime);
  }, [audio]);

  const handlerDurationChange = React.useCallback(() => {
    setDuration(audio.duration);
  }, [audio]);

  const handlerVolumeChange = React.useCallback(() => {
    setVolume(audio.volume);
  }, [audio]);

  const handlerPlayStatus = React.useCallback(() => {
    setIsPlaying(!audio.paused);
  }, []);

  React.useEffect(() => {
    audio.addEventListener('ended', next);
    audio.addEventListener('timeupdate', handlerTimeUpdate)
    audio.addEventListener('durationchange', handlerDurationChange)
    audio.addEventListener('volumechange', handlerVolumeChange)
    audio.addEventListener('play', handlerPlayStatus)
    audio.addEventListener('pause', handlerPlayStatus)
    audio.addEventListener('playing', handlerPlayStatus)

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', prev);
      navigator.mediaSession.setActionHandler('nexttrack', next);
      navigator.mediaSession.setActionHandler('seekbackward', seekBackward);
      navigator.mediaSession.setActionHandler('seekforward', seekForward);
    }

    return () => {
      audio.removeEventListener('ended', next);
      audio.removeEventListener('timeupdate', handlerTimeUpdate)
      audio.removeEventListener('durationchange', handlerDurationChange)
      audio.removeEventListener('volumechange', handlerVolumeChange)
      audio.removeEventListener('play', handlerPlayStatus)
      audio.removeEventListener('pause', handlerPlayStatus)
      audio.removeEventListener('playing', handlerPlayStatus)
    }
  }, []);

  const [playbackRate, setPlaybackRate] = React.useState(audio.playbackRate);
  React.useEffect(() => {
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const [sinkId, setSinkId] = React.useState('');
  React.useEffect(() => {
    if (sinkId) {
      audio.setSinkId(sinkId);
    }
  }, [sinkId]);

  return {
    el: audio,
    playlist,
    playIndex,
    current,
    disabledNext,
    disabledPrev,
    isPlaying,
    duration,
    currentTime,
    volume,
    playbackRate,
    sinkId,
    play,
    pause,
    setPlaylist,
    setPlayIndex,
    setVolume,
    togglePlay,
    next,
    prev,
    seekBackward,
    seekForward,
    setCurrentTime,
    setPlaybackRate,
    setSinkId,
  }
};
