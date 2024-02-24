import { useLocation, useNavigate } from '@modern-js/runtime/router';
import { useMemo } from 'react';

import { IconFavoriteList, IconSearch } from '@douyinfe/semi-icons';
import { Button, Layout, Nav, Avatar } from '@douyinfe/semi-ui';

import { login } from '../login';
import { useUserInfo } from '@/hooks/use-user-info';

import type { NavProps } from '@douyinfe/semi-ui/lib/es/navigation';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const handleNavClick: NavProps['onSelect'] = ({ itemKey }) => {
    navigate(`/${itemKey}`);
  };

  const { userInfo, refreshUserInfo } = useUserInfo();

  const handleLogin = () => {
    login().then(() => refreshUserInfo());
  };

  const navFooterRender = useMemo(() => {
    if (userInfo) {
      return (
        <Avatar size="small" src={userInfo.avatar} alt={userInfo.nickname}>
          {userInfo.nickname}
        </Avatar>
      );
    }
    return (
      <Button type="primary" onClick={handleLogin}>
        登录
      </Button>
    );
  }, [userInfo]);

  return (
    <>
      <Layout.Header>
        <Nav
          mode="horizontal"
          defaultSelectedKeys={[location.pathname.split('/')[1]]}
          items={[
            {
              itemKey: 'search',
              text: '搜索',
              icon: <IconSearch />,
            },
            {
              itemKey: 'collections',
              text: '本单',
              icon: <IconFavoriteList />,
            },
          ]}
          footer={navFooterRender}
          onSelect={handleNavClick}
        />
      </Layout.Header>
    </>
  );
};
