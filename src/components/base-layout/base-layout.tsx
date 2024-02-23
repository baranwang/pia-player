import { Layout } from '@douyinfe/semi-ui';
import { Player } from '../player';
import { Header } from './header';

import styles from './base-layout.module.scss';

export interface BaseLayoutProps {
  children: React.ReactNode;
}
export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Layout className={styles.layout}>
      <Header />
      <Layout.Content className={styles.content}>{children}</Layout.Content>
      <Layout.Footer>
        <Player />
      </Layout.Footer>
    </Layout>
  );
};
