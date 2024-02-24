import { Fragment, createElement } from 'react';

import { Typography } from '@douyinfe/semi-ui';

export function transformHtmlToJsx(html: string, transformEm = true) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const root = doc.body;
  const children = Array.from(root.childNodes);
  return children.map((child, index) => {
    const key = `${index}-${child.textContent}`;
    const defaultRender = () => <Fragment key={key}>{child.textContent}</Fragment>;
    if (child.nodeType === 3) {
      return defaultRender();
    }
    if (child instanceof Element) {
      const tagName = child.tagName.toLowerCase();
      if (tagName === 'em') {
        if (transformEm) {
          return (
            <Typography.Text key={key} mark>
              {child.textContent}
            </Typography.Text>
          );
        } else {
          return defaultRender();
        }
      }
      return createElement(tagName, { key }, child.textContent);
    }
    return defaultRender();
  });
}
