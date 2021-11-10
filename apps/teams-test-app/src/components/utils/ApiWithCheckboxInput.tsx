import * as React from 'react';

import { noHostSdkMsg } from '../../App';

export interface ApiWithCheckboxInputProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  label: string;
  onClick: (input: boolean) => Promise<string>;
  defaultCheckboxState?: boolean;
}

export const ApiWithCheckboxInput = (props: ApiWithCheckboxInputProps): React.ReactElement => {
  const { name, defaultCheckboxState = false, label, onClick, title } = props;
  const [result, setResult] = React.useState('');
  const [value, setValue] = React.useState(defaultCheckboxState);

  const onClickCallback = React.useCallback(async () => {
    setResult(noHostSdkMsg);

    try {
      const result = await onClick(value);
      setResult(result);
    } catch (err) {
      setResult('Error: ' + err);
    }
  }, [value, setResult, onClick]);

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
      <input name={`button_${name}`} type="button" value={title} onClick={onClickCallback} />
      {label}
      <input type="checkbox" name={label} onChange={e => setValue(e.target.checked)} />
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
