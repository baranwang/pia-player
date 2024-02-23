import { Layout, Nav } from '@douyinfe/semi-ui';
import { NavProps } from '@douyinfe/semi-ui/lib/es/navigation';
import { useLocation, useNavigate } from '@modern-js/runtime/router';
import { IconFavoriteList, IconSearch } from '@douyinfe/semi-icons';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const handleNavClick: NavProps['onSelect'] = ({ itemKey }) => {
    navigate(`${itemKey}`);
  };

  return (
    <>
      <Layout.Header>
        <Nav
          mode="horizontal"
          defaultSelectedKeys={[location.pathname]}
          items={[
            {
              itemKey: '/search',
              text: '搜索',
              icon: <IconSearch />,
            },
            {
              itemKey: '/collections',
              text: '本单',
              icon: <IconFavoriteList />,
            },
          ]}
          footer={<>login</>}
          onSelect={handleNavClick}
        />
      </Layout.Header>
    </>
  );
};
