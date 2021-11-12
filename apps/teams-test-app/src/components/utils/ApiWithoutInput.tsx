import * as React from 'react';

export interface ApiWithoutInputProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  onClick: (setResult: (result: string) => void) => string;
}

export const ApiWithoutInput = (props: ApiWithoutInputProps): React.ReactElement => {
  const { name, onClick, title } = props;
  const [result, setResult] = React.useState('');

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
      <input name={`button_${name}`} type="button" value={title} onClick={() => setResult(onClick(setResult))} />
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
