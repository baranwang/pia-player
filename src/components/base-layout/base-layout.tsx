import { useModel } from '@modern-js/runtime/model';
import { useEffect, useRef } from 'react';

import { Layout } from '@douyinfe/semi-ui';
import { useSize } from 'ahooks';

import { Header } from './header';
import { Player } from '../player';
import { layoutHeightModel } from '@/store/layout-height';

import styles from './base-layout.module.scss';

export interface BaseLayoutProps {
  children: React.ReactNode;
}
export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const [, actions] = useModel(layoutHeightModel);
  const ref = useRef(null);
  const size = useSize(ref);
  useEffect(() => {
    actions.setHeight(size?.height ?? 0);
  }, [size?.height]);
  return (
    <Layout className={styles.layout}>
      <Header />
      <Layout.Content className={styles['content-wrapper']}>
        <div ref={ref} className={styles.content}>
          {children}
        </div>
      </Layout.Content>
      <Layout.Footer>
        <Player />
      </Layout.Footer>
    </Layout>
  );
};
