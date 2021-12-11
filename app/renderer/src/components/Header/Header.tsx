import * as React from 'react';
import { Layout } from 'antd';
import { observer } from 'mobx-react';
import { productName } from '../../../../../package.json';

import styles from './header.module.less';

export const Header: React.FC = observer(({ children }) => {
  return (
    <>
      <div className={styles['header-title-bar']}>
        <div className={styles['header-title-bar-logo']}>{productName}</div>
      </div>
      <Layout.Header className={styles.header}>{children}</Layout.Header>
    </>
  );
});
