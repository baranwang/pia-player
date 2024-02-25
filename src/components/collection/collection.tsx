import { Link } from '@modern-js/runtime/router';
import { useMemo } from 'react';

import { Button, Image, List, Space, Typography } from '@douyinfe/semi-ui';
import { useInfiniteScroll } from 'ahooks';

import { api } from '@/api';
import { login } from '@/components/login';
import { useUserInfo } from '@/hooks/use-user-info';

import type { CollectionType } from '@/constant';

interface CollectionProps {
  type?: CollectionType;
}

interface ICollectionResp extends XJ.CollectionListResponse {
  nextPage: number;
}

export const Collection: React.FC<CollectionProps> = ({ type }) => {
  const { userInfo, refreshUserInfo } = useUserInfo();
  const { data, loading, loadMore, noMore, loadingMore, reload } = useInfiniteScroll(
    (prevData?: ICollectionResp) => {
      if (!userInfo) {
        return Promise.reject(new Error('Unauthorized'));
      }
      if (!type) {
        return Promise.resolve({ list: [], nextPage: 1, count: 0 });
      }
      return api.getCollectionList(userInfo.id, type, prevData?.nextPage || 1).then(res => ({
        ...res,
        nextPage: prevData ? prevData.nextPage + 1 : 2,
        count: res.count || prevData?.count || 0,
      }));
    },
    {
      reloadDeps: [userInfo, type],
      isNoMore: data => data?.list.length === data?.count,
      async onError(e) {
        if (e.message === 'Unauthorized') {
          await login();
          await refreshUserInfo();
          reload();
        }
      },
    },
  );
  const loadMoreRender = useMemo(() => {
    if (loading || noMore) {
      return <></>;
    }
    return (
      <Button theme="borderless" type="tertiary" block loading={loadingMore} onClick={loadMore}>
        加载更多
      </Button>
    );
  }, [loading, noMore, loadingMore]);
  return (
    <>
      <List
        dataSource={data?.list}
        loading={loading}
        layout="horizontal"
        grid={{
          gutter: [12, 12],
          xs: 24,
          sm: 12,
          md: 12,
          lg: 8,
          xl: 6,
          xxl: 4,
        }}
        renderItem={item => {
          const linkWrapper = (children: React.ReactNode) => {
            if (item.id) {
              return <Link to={`/collections/${item.id}`}>{children}</Link>;
            }
            return children;
          };
          return (
            <List.Item
              header={linkWrapper(<Image src={item.photo} preview={false} width={56} height={56} />)}
              main={linkWrapper(
                <Space vertical align="start">
                  <Typography.Title heading={5}>{item.title}</Typography.Title>
                  <Typography.Text type="tertiary">{item.article_cnt} 个剧本</Typography.Text>
                </Space>,
              )}
            />
          );
        }}
        loadMore={loadMoreRender}
      />
    </>
  );
};
