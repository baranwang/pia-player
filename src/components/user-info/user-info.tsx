import { Space, Typography, Avatar } from '@douyinfe/semi-ui';
import { useRequest } from 'ahooks';

import { api } from '@/api';

interface UserInfoProps {
  uid: number;
}

export const UserInfo: React.FC<UserInfoProps> = ({ uid }) => {
  const { data } = useRequest(() => api.getUserInfoById(uid), {
    cacheKey: `userInfo-${uid}`,
  });
  return (
    <Space>
      <Avatar size="extra-extra-small" src={data?.avatar} alt={data?.nickname}>
        {data?.nickname}
      </Avatar>
      <Typography.Text>{data?.nickname}</Typography.Text>
    </Space>
  );
};
