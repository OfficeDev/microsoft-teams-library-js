import * as React from 'react';

import { PrettyPrintJson } from './PrettyPrintJson';

export interface ApiContainerProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  result?: string;
}

export const ApiContainer = (props: React.PropsWithChildren<ApiContainerProps>): React.ReactElement => {
  const { children, name, result, title } = props;

  if (!name || !/^[a-zA-Z0-9._]+$/.test(name)) {
    throw new Error('name has to be set and it can only contain alphanumeric characters, dots and underscores.');
  }

  return (
    <div
      className="boxAndButton"
      style={{
        border: '5px solid black',
        gap: 10,
        textAlign: 'center',
        display: 'grid',
        gridTemplateRows: 'auto auto 150px auto 150px',
      }}
      id={`box_${name}`}
    >
      <strong>{title}</strong>
      {children}
      <div
        className="box"
        style={{
          border: '2px solid red',
          height: 150,
          overflow: 'auto',
        }}
      >
        <span id={`text_${name}`} style={{ wordWrap: 'break-word' }}>
          {result}
        </span>
      </div>
      <PrettyPrintJson result={result} />
    </div>
  );
};
