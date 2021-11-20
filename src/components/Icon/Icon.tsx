import React from 'react';

import classNames from 'classnames';
import './icon.less';

export const Icon: React.FC<
  {
    type: string;
  } & React.HTMLAttributes<HTMLElement>
> = ({ type, className, ...otherProps }) => {
  return (
    <span
      {...otherProps}
      className={classNames('material-icons', 'anticon', className)}
      datatype={type}>
      {type}
    </span>
  );
};
