import { Card, Tabs } from '@douyinfe/semi-ui';

import { Collection } from '@/components/collection';
import { CollectionType } from '@/constant';

import styles from './collections.module.scss';

const typeList = [
  {
    id: CollectionType.Self,
    text: '自建',
  },
  {
    id: CollectionType.Fav,
    text: '收藏',
  },
];

export default () => {
  return (
    <>
      <Card>
        <Tabs className={styles.tabs}>
          {typeList.map(({ id, text }) => {
            return (
              <Tabs.TabPane key={id} itemKey={`${id}`} tab={text}>
                <Collection type={id} />
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </Card>
    </>
  );
};
