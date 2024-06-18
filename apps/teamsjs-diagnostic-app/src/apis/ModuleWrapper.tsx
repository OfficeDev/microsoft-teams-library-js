import React, { ReactElement } from 'react';

export interface ModuleWrapperProps {
  title: string;
}

export const ModuleWrapper = (props: React.PropsWithChildren<ModuleWrapperProps>): ReactElement => {
  const { children, title } = props;
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, 400px)', margin: 15 }}>
      <h1 style={{ gridRow: '1 / -1', gridColumn: '1 / -1' }}>{title}</h1>
      {children}
    </div>
  );
};
