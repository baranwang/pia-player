import { useMemo } from 'react';

import { IconSearch } from '@douyinfe/semi-icons';
import { Card, Form, Space, Table, Tag } from '@douyinfe/semi-ui';
import { useRequest } from 'ahooks';

import { api } from '@/api';
import { findClosestTagColor } from '@/utils/common';

import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';

export default () => {
  const columns = useMemo<ColumnProps<XJ.SearchItem>[]>(() => {
    return [
      { title: '编号', dataIndex: 'id' },
      { title: '标题', dataIndex: 'name' },
      {
        title: '标签',
        dataIndex: 'label',
        render: (_, { label }) => {
          return (
            <Space>
              {label.map(item => (
                <Tag key={item.text} color={item.color ? findClosestTagColor(`#${item.color}`) : undefined}>
                  {item.text}
                </Tag>
              ))}
            </Space>
          );
        },
      },
      {
        title: '作者',
        dataIndex: 'author',
      },
    ];
  }, []);

  const { data, run: search } = useRequest(api.search, {
    manual: true,
  });

  const handleSubmit = (values: any) => {
    search(values);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Card title={<Form.Input field="keyword" noLabel prefix={<IconSearch />} placeholder="搜索" />}>
          <Table dataSource={data?.items} pagination={false} columns={columns} />
        </Card>
      </Form>
    </>
  );
};
