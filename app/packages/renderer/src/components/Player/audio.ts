import { useLocalStorageState, usePrevious } from 'ahooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useAudio = ({ onError }: {
  onError?: (e: Error) => void;
} = {}) => {
  const [audio] = useState(
    <HTMLAudioElement & { setSinkId(deviceId: string): void }>new Audio()
  );

  const [playlist, setPlaylist] = useState<
    {
      key: string;
      src: string;
    }[]
  >([]);

  const [playIndex, setPlayIndex] = useState(0);

  useEffect(() => {
    if (playlist.length > 0) {
      if (playIndex < 0) {
        setPlayIndex(0);
      }
      if (playIndex >= playlist.length) {
        setPlayIndex(playlist.length - 1);
      }
    }
  }, [playlist, playIndex]);

  const current = useMemo(
    () => playlist[playIndex],
    [playlist, playIndex]
  );

  const prevAudio = usePrevious(current, (prev, next) => {
    return prev?.src !== next?.src;
  })

  const disabledNext = useMemo(() => {
    return playIndex === playlist.length - 1;
  }, [playIndex, playlist]);

  const disabledPrev = useMemo(() => {
    return playIndex === 0;
  }, [playIndex]);

  useEffect(() => {
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

  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useLocalStorageState('volume', audio.volume);
  const [duration, setDuration] = useState(audio.duration);
  const [currentTime, setCurrentTime] = useState(audio.currentTime);

  const play = useCallback(() => {
    return audio.play().catch((e: Error) => onError?.(e));
  }, [audio])

  const pause = useCallback(() => {
    audio.pause();
  }, [audio])

  const togglePlay = useCallback(() => {
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  }, [audio]);

  const next = useCallback(() => {
    if (playIndex < playlist.length - 1) {
      setPlayIndex(playIndex + 1);
    }
  }, [playlist, playIndex]);

  const prev = useCallback(() => {
    if (playIndex > 0) {
      setPlayIndex(playIndex - 1);
    }
  }, [playlist, playIndex]);

  const seekBackward = useCallback(() => {
    audio.currentTime = Math.max(0, audio.currentTime - 5);
  }, [audio]);

  const seekForward = useCallback(() => {
    audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
  }, [audio]);

  const handlerTimeUpdate = useCallback(() => {
    setCurrentTime(audio.currentTime);
  }, [audio]);

  const handlerDurationChange = useCallback(() => {
    setDuration(audio.duration);
  }, [audio]);

  const handlerVolumeChange = useCallback(() => {
    setVolume(audio.volume);
  }, [audio]);

  const handlerPlayStatus = useCallback(() => {
    setIsPlaying(!audio.paused);
  }, []);

  useEffect(() => {
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

  const [playbackRate, setPlaybackRate] = useState(audio.playbackRate);
  useEffect(() => {
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const [sinkId, setSinkId] = useState('');
  useEffect(() => {
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
