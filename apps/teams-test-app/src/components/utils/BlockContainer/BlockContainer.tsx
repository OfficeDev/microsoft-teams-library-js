import './BlockContainer.css';

import { PropsWithChildren, ReactElement } from 'react';

export type BlockContainerProps = {
  name: string;
};

export const BlockContainer = (props: PropsWithChildren<BlockContainerProps>): ReactElement => {
  const { children, name } = props;
  return (
    <div id={name} className="wrapper">
      {children}
    </div>
  );
};
