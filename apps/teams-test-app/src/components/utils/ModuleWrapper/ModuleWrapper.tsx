import './ModuleWrapper.css';

import { forwardRef, PropsWithChildren, ReactElement } from 'react';

export interface ModuleWrapperProps {
  className?: string;
  heading: string;
}

export const ModuleWrapper = forwardRef<HTMLDivElement, PropsWithChildren<ModuleWrapperProps>>(
  (props, ref): ReactElement => {
    const { className, children, heading } = props;
    console.log('%c ref: ', 'color: turquoise', ref);

    return (
      <div className={`module ${className}`} ref={ref} id={`box_${name}`}>
        <h1 className="moduleHeading">{heading}</h1>
        {children}
      </div>
    );
  },
);

ModuleWrapper.displayName = 'ModuleWrapper';
