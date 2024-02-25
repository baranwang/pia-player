import { useLoaderData, useNavigate, useParams } from '@modern-js/runtime/router';
import { useMemo } from 'react';

import { Breadcrumb, Card, Image, Space, Table, Typography } from '@douyinfe/semi-ui';
import { usePagination } from 'ahooks';

import { api } from '@/api';
import { TableWidget } from '@/components/table-widget';
import { UserInfo } from '@/components/user-info';

import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';

import styles from './collection.module.scss';

export default () => {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();
  const collectionDetail = useLoaderData() as XJ.CollectionDetail;
  const { data, pagination } = usePagination(
    ({ current }) => {
      if (!collectionId) {
        return Promise.resolve({ list: [], total: collectionDetail.article_cnt });
      }
      return api.getCollectionArticleList(collectionId, current).then(res => ({
        list: res.list,
        total: collectionDetail.article_cnt,
      }));
    },
    {
      defaultPageSize: 10,
    },
  );
  const columns = useMemo<ColumnProps<XJ.CollectionArticleItem>[]>(() => {
    return [
      { title: '编号', dataIndex: 'article_id', width: 88 },
      {
        title: '标题',
        dataIndex: 'title',
        ellipsis: true,
        render: (_, { title, photo }) => (
          <Typography.Text ellipsis={{ showTooltip: { opts: { content: title } } }}>
            <Space>
              <Image src={photo} width={24} height={24} />
              {title}
            </Space>
          </Typography.Text>
        ),
      },

      {
        title: '标签',
        dataIndex: 'tag',
        width: 240,
        render: (_, record) => (
          <TableWidget.Tags
            roleMale={record.role_male}
            roleFemale={record.role_female}
            wordCount={record.length}
            hasBgm={Boolean(record.has_bgm)}
          />
        ),
      },
      {
        title: '作者',
        dataIndex: 'author_name',
        width: 128,
        ellipsis: true,
        render: author => <Typography.Text ellipsis={{ showTooltip: true }}>{author}</Typography.Text>,
      },
      {
        title: '',
        key: 'operate',
        width: 56,
        render: (_, record) => <TableWidget.Operate articleId={record.article_id} hasBgm={Boolean(record.has_bgm)} />,
      },
    ];
  }, []);
  return (
    <>
      <Breadcrumb style={{ marginBottom: 12 }}>
        <Breadcrumb.Item
          href="/collections"
          onClick={(route, e) => {
            e.preventDefault();
            if (route.href) {
              navigate(route.href);
            }
          }}
        >
          本单
        </Breadcrumb.Item>
        <Breadcrumb.Item noLink>{collectionDetail.title}</Breadcrumb.Item>
      </Breadcrumb>
      <Card
        className={styles.content}
        title={collectionDetail.title}
        headerExtraContent={<UserInfo uid={collectionDetail.uid} />}
      >
        <Table
          dataSource={data?.list}
          columns={columns}
          pagination={{
            currentPage: pagination.current,
            onPageChange: pagination.changeCurrent,
            total: pagination.total,
          }}
        />
      </Card>
    </>
  );
};
