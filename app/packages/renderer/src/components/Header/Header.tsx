import * as React from 'react';
import { Layout } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import styles from './header.module.less';

export const Header: React.FC = observer(({ children }) => {
  const [platform, setPlatform] = React.useState(window.platform);

  React.useEffect(() => {
    setPlatform(window.platform);
  }, []);

  return (
    <>
      <div className={classNames(styles['header-title-bar'], platform)}>
        <div className={styles['header-title-bar-logo']}>Pia Player</div>
      </div>
      <Layout.Header className={styles.header}>{children}</Layout.Header>
    </>
  );
});
