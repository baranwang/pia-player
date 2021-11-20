import { ConfigProvider, Layout } from 'antd';
import locale from 'antd/lib/locale/zh_CN';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Player } from './components/Player';

import { IndexPage } from './pages/index';

import './global.less';
import styles from './app.module.less';

function render() {
  ReactDOM.render(
    <ConfigProvider locale={locale}>
      <Layout className={styles.app}>
        <IndexPage />
        <Player />
      </Layout>
    </ConfigProvider>,
    document.getElementById('root')
  );
}

render();
