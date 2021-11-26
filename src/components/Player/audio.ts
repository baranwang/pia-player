import { message } from 'antd';

export class AudioPlayer {
  private audio = new Audio();

  public playlist: BGM[] = [];

  private _playIndex = 0;

  public get playIndex() {
    return this._playIndex;
  }

  public set playIndex(value: number) {
    this._playIndex = value;
    if (this.current?.filepath) {
      this.audio.src = this.current.filepath;
    }
  }

  public get current() {
    const bgm = this.playlist[this.playIndex];
    return bgm;
  }

  public get isPlaying() {
    return !this.audio.paused;
  }

  public get volume() {
    return this.audio.volume;
  }

  public set volume(value: number) {
    this.audio.volume = value ?? 1;
  }

  public get duration() {
    return this.audio.duration ?? 0;
  }

  public get currentTime() {
    return this.audio.currentTime ?? 0;
  }

  public set currentTime(value: number) {
    this.audio.currentTime = value;
  }

  public get playbackRate() {
    return this.audio.playbackRate;
  }

  public set playbackRate(value: number) {
    this.audio.playbackRate = value;
  }

  public play() {
    this.audio.play().catch((e: Error) => {
      if (e.name === 'NotSupportedError') {
        message.warning('该音频文件不支持在线播放，正在等待缓存解码');
      }
    });
  }

  public pause() {
    this.audio.pause();
  }

  public togglePlay() {
    console.log(this);

    if (!this.current) {
      return;
    }
    this.isPlaying ? this.pause() : this.play();
  }

  public next() {
    if (this.playlist && this.playIndex < this.playlist.length - 1) {
      this.playIndex += 1;
      this.play();
    }
  }

  public prev() {
    if (this.playlist && this.playIndex > 0) {
      this.playIndex -= 1;
      this.play();
    }
  }

  public seekBackward() {
    this.currentTime = Math.max(0, this.currentTime - 5);
  }

  public seekForward() {
    this.currentTime = Math.min(this.currentTime + 5, this.duration);
  }

  public setVolume(arg: number | ((volume: number) => number)) {
    typeof arg === 'function'
      ? (this.volume = arg(this.volume))
      : (this.volume = arg);
  }

  public setSinkId(sinkId: string) {
    (this.audio as any).setSinkId(sinkId).catch((e: Error) => {
      console.error(e);
    });
  }

  constructor() {
    this.audio.addEventListener('ended', () => {
      this.next();
    });
    navigator.mediaSession.setActionHandler('play', () => {
      this.play();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      this.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      this.prev();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      this.next();
    });
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      this.seekBackward();
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      this.seekForward();
    });

    this.togglePlay = this.togglePlay.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.seekBackward = this.seekBackward.bind(this);
    this.seekForward = this.seekForward.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.setSinkId = this.setSinkId.bind(this);
  }
}
