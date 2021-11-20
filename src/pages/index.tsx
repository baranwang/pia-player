import React from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Layout,
  Select,
  Table,
  TablePaginationConfig,
  Tooltip,
} from 'antd';
import { searchDrama, viewDrama } from '@/api';
import { AppDatabase } from '@/db';
import { useRequest } from 'ahooks';
import { observer } from 'mobx-react';
import { useStores } from '@/store';
import { Header } from '@/components/Header';
import {
  Ellipsis,
  PlayDramaButton,
  SelectLenthRange,
  SelectRole,
} from '@/components/TableWidget';

import styles from './index.module.less';

const { ipcRenderer } = window;

const db = new AppDatabase();

const getDramaFromLocal = async (current: number, pageSize: number) => {
  const count = await db.drama.count();
  const list: Array<Aipiaxi.DramaInfoInSearch> = (
    await db.drama
      .orderBy('id')
      .offset((current - 1) * pageSize)
      .limit(pageSize)
      .toArray()
  ).map((item) => ({
    ...item,
    article_url: '',
    author: item.nickname,
    bgm_count: item.bgm.length,
    has_ost: '0',
    index_name: '',
    recommend_count: '',
    subscribe_count: '',
    tags: '',
    thumbnail: item.photo || '',
    title: item.name,
    type: `${item.type}`,
    update_timestamp: item.updated_at,
    word_count: item.length,
  }));
  return { count, list };
};

export const IndexPage = observer(() => {
  const { globalStore, playlistStore } = useStores();

  const [config, setConfig] = React.useState<Aipiaxi.Config>();

  const [keyword, setKeyword] = React.useState('');
  const [type, setType] = React.useState(0);
  const [tags, setTags] = React.useState<number[]>([]);
  const [historical, setHistorical] = React.useState(0);

  const [lengthRange, setLengthRange] = React.useState<[number, number]>([
    0, 90000,
  ]);

  const [role, setRole] = React.useState<[number, number]>([-1, -1]);

  const searchQuery = React.useMemo(() => {
    let query: string[] = [];
    if (keyword) {
      query.push(`default:term:${keyword}`);
    }
    if (type) {
      query.push(`tag:term:${type}`);
    }
    if (historical) {
      query.push(`tag:term:${historical}`);
    }
    if (tags.length) {
      query = query.concat(tags.map((tag) => `tag:term:${tag}`));
    }
    if (lengthRange[0] !== 0 || lengthRange[1] !== 90000) {
      query.push(`length:range:${lengthRange[0]},${lengthRange[1]}`);
    }
    if (role[0] > -1) {
      query.push(`role_male:eq:${role[0]}`);
    }
    if (role[1] > -1) {
      query.push(`role_female:eq:${role[1]}`);
    }
    return query.join(';');
  }, [keyword, type, historical, tags, lengthRange, role]);

  React.useEffect(() => {
    globalStore.getConfig().then((config) => {
      setConfig(config);
      ipcRenderer.on('search', (event, arg) => {
        const url = new URL(arg);
        if (url.pathname === '/advance/search') {
          const tags = Object.values(config).flat();
          const tagText = url.searchParams.get('tag');
          const tag = tags.find((tag) => tag.text === tagText);
          if (tag) {
            setTags([tag.id]);
          }
        }
      });
    });
  }, []);

  const { data, pagination, loading } = useRequest(
    ({ current = 1, pageSize = 20 }) => {
      if (searchQuery) {
        return searchDrama({ page: current, pageSize, q: searchQuery });
      } else {
        return getDramaFromLocal(current, pageSize);
      }
    },
    {
      paginated: true,
      formatResult: (res) => ({ ...res, total: res.count }),
      refreshDeps: [searchQuery],
      cacheKey: `search-${searchQuery}`,
    }
  );

  return (
    <>
      <Header>
        <Input.Search
          placeholder="本号 / 标题 / 作者"
          addonBefore={
            config ? (
              <Select
                className={styles['search-type']}
                options={[
                  {
                    label: '全部',
                    value: 0,
                  },
                  ...config.type.map((item) => ({
                    label: item.text,
                    value: item.id,
                  })),
                ]}
                value={type}
                onChange={setType}
              />
            ) : undefined
          }
          onSearch={(value) => {
            setKeyword(value.trim());
          }}
        />
      </Header>
      <Layout.Content className={styles.main}>
        <Card className={styles['search-filter']} bordered={false}>
          <Form layout="inline">
            <Form.Item label="时代">
              <Select
                options={
                  config
                    ? [
                        {
                          label: '不限',
                          value: 0,
                        },
                        ...config.historical.map((item) => ({
                          label: item.text,
                          value: item.id,
                        })),
                      ]
                    : []
                }
                value={historical}
                onChange={setHistorical}
              />
            </Form.Item>
            <Form.Item label="标签">
              <Select
                mode="multiple"
                allowClear
                maxTagCount="responsive"
                options={config?.tag.map((item) => ({
                  label: item.text,
                  value: item.id,
                }))}
                value={tags}
                onChange={setTags}
              />
            </Form.Item>
          </Form>
        </Card>
        <Table<Aipiaxi.DramaInfoInSearch>
          className={styles['search-reslut']}
          dataSource={data?.list}
          rowKey="id"
          columns={[
            {
              title: '本号',
              dataIndex: 'id',
              width: 96,
            },
            {
              title: '类型',
              dataIndex: 'type',
              width: 96,
              filterMultiple: false,
              filtered: !!type,
              filteredValue: type ? [type] : null,
              filters: config?.type.map((item) => ({
                text: item.text,
                value: item.id,
              })),
              render: (value) => {
                return config?.type.find((item) => `${item.id}` === value)
                  ?.text;
              },
            },
            {
              title: '标题',
              dataIndex: 'title',
              ellipsis: true,
              render: (value) => <Ellipsis>{value}</Ellipsis>,
            },
            {
              title: '角色',
              key: 'role',
              width: 120,
              filtered: role[0] > -1 || role[1] > -1,
              filterDropdown: ({ confirm }) => (
                <SelectRole
                  value={role}
                  onChange={([...value]) => {
                    setRole(value);
                    confirm({ closeDropdown: true });
                  }}
                />
              ),
              render: (_, record) =>
                `${record.role_male}男 . ${record.role_female}女`,
            },
            {
              title: '字数',
              width: 96,
              dataIndex: 'word_count',
              filtered: lengthRange[0] !== 0 || lengthRange[1] !== 90000,
              filterDropdown: ({ confirm }) => (
                <SelectLenthRange
                  value={lengthRange}
                  onChange={(value) => {
                    setLengthRange(value);
                    confirm({ closeDropdown: true });
                  }}
                />
              ),
            },
            {
              title: '作者',
              width: 120,
              dataIndex: 'author',
              ellipsis: true,
              render: (value) => {
                const authorDom = (
                  <span dangerouslySetInnerHTML={{ __html: value }} />
                );
                return (
                  <Tooltip placement="topLeft" title={authorDom}>
                    {authorDom}
                  </Tooltip>
                );
              },
            },
            {
              title: '操作',
              key: 'action',
              width: 144,
              render: (_, record) => {
                const acitons: React.ReactNode[] = [
                  <Button
                    key="view"
                    type="link"
                    onClick={() => {
                      viewDrama(
                        record.id,
                        record.title.replace(/<[^>]+>/g, '')
                      );
                    }}>
                    查看
                  </Button>,
                ];
                if (record.bgm_count > 0) {
                  acitons.push(
                    <PlayDramaButton
                      dramaId={record.id}
                      key="play"
                      onSuccess={(res) => {
                        playlistStore.addDramaToList(res);
                      }}
                    />
                  );
                }
                return acitons;
              },
            },
          ]}
          pagination={pagination as TablePaginationConfig}
          loading={loading}
          onChange={(pagination, filters) => {
            console.log(filters);
            setType(filters.type ? (filters.type[0] as number) : 0);
          }}
        />
      </Layout.Content>
    </>
  );
});
