import { ConfigProvider, Layout } from 'antd';
import locale from 'antd/lib/locale/zh_CN';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Player } from './components/Player';

import { IndexPage } from './pages/index';

import styles from './app.module.less';

const App = () => {
  return (
    <ConfigProvider locale={locale}>
      <Layout className={styles.app}>
        <IndexPage />
        <Player />
      </Layout>
    </ConfigProvider>
  );
};

function render() {
  ReactDOM.render(<App />, document.getElementById('root'));
}

render();
