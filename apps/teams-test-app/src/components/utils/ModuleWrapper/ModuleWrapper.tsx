import './ModuleWrapper.css';

import { ForwardedRef } from 'react';

export interface ModuleWrapperProps {
  className?: string;
  heading: string;
  ref?: ForwardedRef<HTMLDivElement>;
}

export const ModuleWrapper = (props: React.PropsWithChildren<ModuleWrapperProps>): React.ReactElement => {
  const { className, children, heading, ref } = props;

  return (
    <div className={`module ${className}`} ref={ref} id={`box_${name}`}>
      <h1 className="moduleHeading">{heading}</h1>
      {children}
    </div>
  );
};
