import { useEffect, useMemo, useReducer } from 'react';

import { IconMute, IconVolume1, IconVolume2 } from '@douyinfe/semi-icons';
import { Button, Dropdown, Slider } from '@douyinfe/semi-ui';
import { Howler } from 'howler';

import { useMediaDevices } from '@/hooks/use-media-devices';

import type { SliderProps } from '@douyinfe/semi-ui/lib/es/slider';

import styles from './player.module.scss';

export const Volume: React.FC = () => {
  const { mediaDevices } = useMediaDevices();
  const outputDevices = useMemo(
    () => mediaDevices.audiooutput?.filter(device => device.deviceId !== 'default'),
    [mediaDevices],
  );
  const [deviceId, setDeviceId] = useReducer((state: string, value: string) => {
    (Howler.ctx as ExtendedAudioContext)?.setSinkId(value);
    return value;
  }, outputDevices?.[0].deviceId);
  useEffect(() => {
    if (!deviceId && outputDevices?.[0].deviceId) {
      setDeviceId(outputDevices[0].deviceId);
    }
  }, [outputDevices, deviceId]);

  const [volume, setVolume] = useReducer((state: number, value: number) => {
    Howler.volume(value / 100);
    return value;
  }, Howler.volume() * 100);
  const handleVolumeChange: SliderProps['onChange'] = value => {
    setVolume((value as number) ?? 1);
  };
  const volumeIconRender = useMemo(() => {
    if (volume === 0) {
      return <IconMute />;
    }
    if (volume > 0 && volume < 50) {
      return <IconVolume1 />;
    }
    return <IconVolume2 />;
  }, [volume]);

  return (
    <>
      <Dropdown
        trigger="click"
        showTick
        render={
          <Dropdown.Menu>
            {outputDevices?.map(device => (
              <Dropdown.Item
                key={device.deviceId}
                active={deviceId === device.deviceId}
                onClick={() => setDeviceId(device.deviceId)}
              >
                {device.label}
              </Dropdown.Item>
            ))}
            <Slider className={styles['player-volume']} value={volume} onChange={handleVolumeChange} />
          </Dropdown.Menu>
        }
      >
        <Button theme="borderless" size="large" type="tertiary" icon={volumeIconRender} />
      </Dropdown>
    </>
  );
};
