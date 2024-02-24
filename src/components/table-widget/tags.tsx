import { useMemo } from 'react';

import { Space, Tag } from '@douyinfe/semi-ui';

interface TagsProps {
  roleMale: number;
  roleFemale: number;
  wordCount: number;
  hasBgm: boolean;
}

export const Tags: React.FC<TagsProps> = ({ roleMale, roleFemale, wordCount, hasBgm }) => {
  const tags = useMemo(() => {
    const tagList = [
      roleMale === -1 && roleFemale === -1 ? '多人不限' : `${roleMale}男${roleFemale}女`,
      `${wordCount}字`,
    ];
    if (hasBgm) {
      tagList.push('有BGM');
    }
    return tagList;
  }, [roleMale, roleFemale, wordCount, hasBgm]);
  return (
    <Space>
      {tags.map(tag => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </Space>
  );
};
