import * as React from 'react';
import { Button, Dropdown, Menu, Slider } from 'antd';
import { Icon } from '/@/components/Icon';

import styles from '../player.module.less';

export const PlayerVolume: React.FC<{
  value: number;
  device?: string | null;
  onVolumeChange: (volume: number) => void;
  onDeviceChange: (deviceId: string) => void;
}> = ({ value, device, onVolumeChange, onDeviceChange }) => {
  const [deviceList, setDeviceList] = React.useState<MediaDeviceInfo[]>([]);

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const deviceList = devices.filter((device) => device.kind === 'audiooutput');
      setDeviceList(deviceList);
    });
  }, [device]);

  React.useEffect(() => {
    if (!device) {
      const deviceId = deviceList.find(
        (device) => device.label === 'default' || device.deviceId === 'default',
      )?.deviceId;
      deviceId && onDeviceChange(deviceId);
    }
  }, [device, deviceList]);

  return (
    <Dropdown
      trigger={['click']}
      arrow
      overlay={
        <Menu
          selectedKeys={device ? [device] : undefined}
          onClick={(info) => {
            onDeviceChange(info.key);
          }}
        >
          {!!deviceList.length && (
            <Menu.ItemGroup title="输出">
              {deviceList.map((item) => (
                <Menu.Item key={item.deviceId}>{item.label}</Menu.Item>
              ))}
            </Menu.ItemGroup>
          )}
          <Menu.Divider />
          <div className={styles['player-actions-volume-slider']}>
            <Slider
              value={value}
              min={0}
              max={1}
              step={0.01}
              tipFormatter={(value) => `${Math.floor((value || 0) * 100)}%`}
              onChange={onVolumeChange}
            />
          </div>
        </Menu>
      }
    >
      <Button
        type="text"
        icon={
          <Icon
            type={(() => {
              if (value === 0) {
                return 'volume_off';
              }
              if (value < 0.5) {
                return 'volume_down';
              }
              return 'volume_up';
            })()}
          />
        }
      />
    </Dropdown>
  );
};
