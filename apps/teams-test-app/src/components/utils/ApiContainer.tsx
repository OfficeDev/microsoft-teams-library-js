import * as React from 'react';

export interface ApiContainerProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  result?: string;
}

export const ApiContainer = (props: React.PropsWithChildren<ApiContainerProps>): React.ReactElement => {
  const { children, name, result } = props;

  if (!name || !/^[a-zA-Z0-9.]+$/.test(name)) {
    throw new Error('name has to be set and it can only contain alphanumeric characters.');
  }

  return (
    <div
      className="boxAndButton"
      style={{
        display: 'inline-block',
        height: 200,
        width: 400,
        border: '5px solid black',
        textAlign: 'center',
      }}
      id={`box_${name}`}
    >
      {children}
      <div
        className="box"
        style={{
          border: '2px solid red',
          height: 150,
          width: 400,
          overflow: 'auto',
        }}
      >
        <span id={`text_${name}`} style={{ wordWrap: 'break-word' }}>
          {result}
        </span>
      </div>
    </div>
  );
};
