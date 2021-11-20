import { Layout } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';

import styles from './header.module.less';

export const Header: React.FC = observer(({ children }) => {
  return (
    <>
      <div className={styles['header-title-bar']} onClick={()=>{
        console.log('click')
      }}>
      </div>
      <Layout.Header className={styles.header}>{children}</Layout.Header>
    </>
  );
});
