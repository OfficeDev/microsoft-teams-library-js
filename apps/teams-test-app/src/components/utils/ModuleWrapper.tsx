import React, { ReactElement } from 'react';

export interface ModuleWrapperProps {
  title: string;
}

export const ModuleWrapper = (props: React.PropsWithChildren<ModuleWrapperProps>): ReactElement => {
  const { children, title } = props;
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  return (
    <div
      style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, 400px)', margin: 15 }}
      id={'header_title'}
    >
      <h1 style={{ gridRow: '1 / -1', gridColumn: '1 / -1' }} onClick={() => setIsCollapsed(!isCollapsed)}>
        {title}
      </h1>
      {!isCollapsed && children}
    </div>
  );
};
