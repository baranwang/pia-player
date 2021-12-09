import * as React from "react";
import { Button, Space, message } from "antd";
import { useLocalStorageState, useMap } from "ahooks";
import { observer } from "mobx-react";
import Marquee from "react-fast-marquee";
import PQueue from "p-queue";
import { Icon } from "/@/components/Icon";
import { PlayerPlaybackRate } from "./widget/PlaybackRate";
import { PlayerPlaylist } from "./widget/Playlist";
import { PlayerProgress } from "./widget/Progress";
import { PlayerVolume } from "./widget/Volume";
import { useAudio } from "./audio";
import { downloadBGM } from "/@/api";
import { useStores } from "/@/store";
import { EK } from "/@eventKeys";

import styles from "./player.module.less";
import defaultCover from "./assets/default-cover.png?inline";

const donwloadQueue = new PQueue({ concurrency: 3 });

export const Player = observer(() => {
  const { playlistStore } = useStores();

  const audio = useAudio({
    onError: (e) => {
      if (e.name === "NotSupportedError") {
        message.warning("该音频文件不支持在线播放，正在等待缓存解码");
      }
    },
  });

  const [progressMap, { set: setProgress }] = useMap<string, number>();

  const progress = React.useMemo(
    () => Object.fromEntries(progressMap),
    [progressMap]
  );

  React.useEffect(() => {
    const { playlist } = playlistStore;
    if (!playlist) return;
    audio.setPlaylist(
      playlist.map((item) => ({
        key: item.hash,
        src: item.filepath || item.url,
      }))
    );
    audio.setPlayIndex(0);
    playlist.forEach(async (item, index) => {
      const data = await donwloadQueue.add(async () => {
        const { filepath } = await downloadBGM(item, (options) => {
          setProgress(item.hash, options.ratio);
        });
        return { ...item, filepath };
      });
      audio.setPlaylist((list) => {
        const newList = [...list];
        newList[index] = {
          key: data.hash,
          src: data.filepath || data.url,
        };
        return newList;
      });
    });
  }, [playlistStore.playlist]);

  const activeDrama = React.useMemo(
    () => playlistStore.activeDrama || null,
    [playlistStore.activeDrama]
  );

  const activeBGM = React.useMemo(() => {
    return playlistStore.playlist?.[audio.playIndex] || null;
  }, [playlistStore.playlist, audio.playIndex]);

  const [activeDevice, setActiveDevice] = useLocalStorageState<
    MediaDeviceInfo["deviceId"] | null
  >("activeDevice", {
    defaultValue: null,
  });

  React.useEffect(() => {
    if (activeDevice) {
      audio.setSinkId(activeDevice);
    }
  }, [activeDevice]);

  React.useEffect(() => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeBGM?.name,
      artist: activeDrama?.name,
      artwork: [{ src: activeDrama?.photo || "" }],
    });
  }, [activeBGM]);

  React.useEffect(() => {
    window.ipcRenderer.on(EK.togglePlay, audio.togglePlay);
    window.ipcRenderer.on(EK.volumeUp, () => {
      audio.setVolume((value) => Math.min(1, (value || 0) + 0.05));
    });
    window.ipcRenderer.on(EK.volumeDown, () => {
      audio.setVolume((value) => Math.max(0, (value || 0) - 0.05));
    });
    window.ipcRenderer.on(EK.nextTrack, () => {
      audio.setPlayIndex((index) => index + 1);
    });
    window.ipcRenderer.on(EK.prevTrack, () => {
      audio.setPlayIndex((index) => index - 1);
    });
    window.ipcRenderer.on(EK.seekForward, audio.seekForward);
    window.ipcRenderer.on(EK.seekBackward, audio.seekBackward);
  }, []);

  React.useEffect(() => {
    const controls: MenusControls = [];
    const canPlay = !!audio.current?.key;
    if (canPlay) {
      controls.push("togglePlay");
    }
    if (canPlay && !audio.disabledNext) {
      controls.push("nextTrack");
    }
    if (canPlay && !audio.disabledPrev) {
      controls.push("prevTrack");
    }
    if (audio.volume > 0) {
      controls.push("volumeDown");
    }
    if (audio.volume < 1) {
      controls.push("volumeUp");
    }
    window.ipcRenderer.send(EK.changeMenu, {
      controls,
      isPlaying: audio.isPlaying,
    });
  }, [
    audio.current?.key,
    audio.disabledNext,
    audio.disabledPrev,
    audio.volume,
    audio.isPlaying,
  ]);

  if (!audio.current) return <></>;

  return (
    <div className={styles.player}>
      <PlayerProgress
        duration={audio.duration ?? 0}
        currentTime={audio.currentTime}
        playStatus={audio.isPlaying}
        onProgressChange={(value) => {
          audio.setCurrentTime(value);
          audio.el.currentTime = value;
        }}
        onPlay={audio.play}
        onPause={audio.pause}
      />
      <div className={styles["player-actions"]}>
        <Space className={styles["player-meta"]}>
          <img
            className={styles["player-meta-cover"]}
            src={activeDrama?.photo || defaultCover}
          />
          <Marquee
            className={styles["player-meta-title"]}
            gradientWidth={40}
            gradientColor={
              (JSON.parse(styles.white) as string)
                .split(",")
                .map((v) => +v) as any
            }
            play={audio.isPlaying}>
            {activeBGM?.name}
          </Marquee>
        </Space>

        <Space size="middle">
          <Button
            type="text"
            icon={<Icon type="skip_previous" />}
            disabled={audio.disabledPrev}
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
            icon={<Icon type={audio.isPlaying ? "pause" : "play_arrow"} />}
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
            disabled={audio.disabledNext}
            onClick={audio.next}
          />
        </Space>

        <Space className={styles["player-actions-right"]}>
          <PlayerPlaybackRate
            value={audio.playbackRate}
            onChange={audio.setPlaybackRate}
          />
          <PlayerVolume
            value={audio.volume ?? 0}
            onVolumeChange={audio.setVolume}
            device={activeDevice}
            onDeviceChange={setActiveDevice}
          />

          <PlayerPlaylist
            playlist={playlistStore.playlist || []}
            index={audio.playIndex}
            progress={progress}
            onChange={audio.setPlayIndex}
          />
        </Space>
      </div>
    </div>
  );
});
