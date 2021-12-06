import * as React from 'react';
import { getDrama } from '/@/api';
import { useRequest } from 'ahooks';
import { Button, Form, Select, Slider, Tooltip } from 'antd';

import styles from './table-widget.module.less';

export const SelectLenthRange: React.FC<{
  value: [number, number];
  onChange: (value: [number, number]) => void;
}> = ({ value, onChange }) => {
  const [rangeValue, setRangeValue] = React.useState(value);
  return (
    <>
      <div className={styles['lenth-range']}>
        <Slider
          range={{ draggableTrack: true }}
          min={0}
          max={90000}
          step={100}
          value={rangeValue}
          onChange={setRangeValue}
        />
      </div>
      <div className="ant-table-filter-dropdown-btns">
        <Button
          type="link"
          size="small"
          onClick={() => {
            onChange([0, 90000]);
          }}>
          重置
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            onChange(rangeValue);
          }}>
          确定
        </Button>
      </div>
    </>
  );
};

export const SelectRole: React.FC<{
  value: [number, number];
  onChange: (value: [number, number]) => void;
}> = ({ value, onChange }) => {
  const [role, setRole] = React.useState(value);
  return (
    <>
      <Form className={styles.role} layout="inline">
        {['男', '女'].map((item, index) => (
          <Form.Item key={item} label={item}>
            <Select
              value={role[index]}
              options={Array.from({ length: 6 }, (_, i) => i - 1).map((i) => ({
                label: i < 0 ? '不限' : `${i} 人`,
                value: i,
              }))}
              onChange={(value) => {
                setRole((role) => {
                  role[index] = value;
                  return [...role];
                });
              }}
            />
          </Form.Item>
        ))}
      </Form>

      <div className="ant-table-filter-dropdown-btns">
        <Button
          type="link"
          size="small"
          onClick={() => {
            onChange([-1, -1]);
          }}>
          重置
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            onChange(role);
          }}>
          确定
        </Button>
      </div>
    </>
  );
};

export const PlayDramaButton: React.FC<{
  dramaId: number;
  onSuccess?: (res: Aipiaxi.DramaInfo) => void;
}> = ({ dramaId, onSuccess }) => {
  const { run, loading } = useRequest(() => getDrama(dramaId), {
    manual: true,
  });

  return (
    <Button
      type="link"
      loading={loading}
      onClick={() => {
        run().then((res) => {
          onSuccess?.(res);
        });
      }}>
      播放
    </Button>
  );
};

export const Ellipsis: React.FC<{
  children: string;
}> = ({ children }) => {
  return (
    <Tooltip placement="topLeft" title={children.replace(/<[^>]+>/g, '')}>
      <span dangerouslySetInnerHTML={{ __html: children }} />
    </Tooltip>
  );
};
