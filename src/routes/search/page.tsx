import { useModel } from '@modern-js/runtime/model';
import { useCallback, useMemo, useReducer, useRef } from 'react';

import { IconSearch } from '@douyinfe/semi-icons';
import { Card, Form, Table, Typography } from '@douyinfe/semi-ui';
import { useInfiniteScroll } from 'ahooks';

import { api } from '@/api';
import { TableWidget } from '@/components/table-widget';
import { useConfig } from '@/hooks/use-config';
import { layoutHeightModel } from '@/store/layout-height';
import { transformHtmlToJsx } from '@/utils/html';

import type { ColumnProps, OnChange, OnRow, VirtualizedProps } from '@douyinfe/semi-ui/lib/es/table';

const renderHtml = (html: string) => (
  <Typography.Text ellipsis={{ showTooltip: { opts: { content: transformHtmlToJsx(html, false) } } }}>
    {transformHtmlToJsx(html)}
  </Typography.Text>
);

export default () => {
  const { config, configMap } = useConfig();

  let virtualizedListRef = useRef<any>(null);

  const columns = useMemo<ColumnProps<XJ.SearchItem>[]>(() => {
    return [
      { title: '编号', dataIndex: 'id', width: 88 },
      {
        title: '类型',
        dataIndex: 'type',
        width: 80,
        filterMultiple: false,
        filters: config?.type.map(item => ({ text: item.text, value: item.id })),
        render: (_, { type }) => configMap?.type[type] || '-',
      },
      {
        title: '标题',
        dataIndex: 'title',
        render: (_, { title, type }) => {
          const typeText = configMap?.type[type] || '';
          let titleText = title;
          if (titleText.startsWith(typeText)) {
            titleText = titleText.replace(new RegExp(`^${typeText}·`), '');
          }
          return renderHtml(titleText.trim());
        },
      },
      {
        title: '标签',
        key: 'tags',
        width: 240,
        render: (_, record) => (
          <TableWidget.Tags
            roleMale={record.role_male}
            roleFemale={record.role_female}
            wordCount={record.word_count}
            hasBgm={Boolean(record.bgm_count)}
          />
        ),
      },
      {
        title: '作者',
        dataIndex: 'author',
        width: 128,
        render: (_, { author }) => renderHtml(author),
      },
      {
        title: '',
        key: 'operate',
        width: 56,
        render: (_, record) => <TableWidget.Operate articleId={record.id} hasBgm={Boolean(record.bgm_count)} />,
      },
    ];
  }, [config, configMap]);

  const [searchParams, setSearchParams] = useReducer(
    (state: string[], action: { type: 'keyword' | 'type'; value: any[] }) => {
      let newState = [...state];
      if (action.type === 'keyword') {
        newState = newState.filter(item => !item.startsWith('default:term:'));
        if (action.value.length) {
          newState.push(`default:term:${action.value[0]}`);
        }
      }
      if (action.type === 'type') {
        newState = newState.filter(item => !item.startsWith('tag:term:'));
        action.value.forEach(value => {
          newState.push(`tag:term:${value}`);
        });
      }
      virtualizedListRef.current?.scrollToItem(0);
      return newState;
    },
    [],
  );

  const itemSize = 50;

  const { data, loading, loadMore, noMore, loadingMore } = useInfiniteScroll(
    (currentData: XJ.SearchResponse['data'] | undefined) => {
      return api
        .search({
          q: searchParams.join(';'),
          page: ((currentData?.page ?? 0) + 1).toString(),
          page_size: (currentData?.page_size ?? itemSize).toString(),
        })
        .then(res => res.data);
    },
    {
      reloadDeps: [searchParams],
      isNoMore: data => (data?.count ?? 0) <= (data?.page ?? 0) * (data?.page_size ?? 0),
    },
  );

  const [{ height: layoutHeight }] = useModel(layoutHeightModel);

  const scroll = useMemo(() => ({ y: layoutHeight - 200 }), [layoutHeight]);

  const virtualized = useMemo<VirtualizedProps>(() => {
    return {
      itemSize,
      onScroll: ({ scrollDirection, scrollOffset, scrollUpdateWasRequested }) => {
        if (
          scrollDirection === 'forward' &&
          (scrollOffset ?? 0) >= ((data?.list ?? []).length - Math.ceil(scroll.y / itemSize) * 1.5) * itemSize &&
          !scrollUpdateWasRequested &&
          !noMore &&
          !loadingMore
        ) {
          loadMore();
        }
      },
    };
  }, [scroll, noMore, loadingMore]);

  const handleSubmit = useCallback(
    (values: any) => {
      const { keyword } = values;
      setSearchParams({ type: 'keyword', value: keyword ? [keyword] : [] });
    },
    [virtualizedListRef],
  );

  const handleRow: OnRow<XJ.SearchItem> = record => {
    if (record?.style === 1) {
      return { style: { backgroundColor: 'var(--semi-color-info-light-default)' } };
    }
    if (record?.style) {
      return { style: { backgroundColor: 'var(--semi-color-fill-0)' } };
    }
    return {};
  };

  const handleTableChange: OnChange<XJ.SearchItem> = ({ filters }) => {
    const typeFilter = filters?.find(item => item.dataIndex === 'type');
    setSearchParams({ type: 'type', value: typeFilter?.filteredValue ?? [] });
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Card
          title={
            <Form.Input
              field="keyword"
              noLabel
              prefix={<IconSearch />}
              placeholder="搜索"
              fieldStyle={{ padding: 0 }}
            />
          }
        >
          <Table
            getVirtualizedListRef={ref => (virtualizedListRef = ref)}
            dataSource={data?.list}
            pagination={false}
            columns={columns}
            scroll={scroll}
            loading={loading || loadingMore}
            virtualized={virtualized}
            onRow={handleRow}
            onChange={handleTableChange}
          />
        </Card>
      </Form>
    </>
  );
};
