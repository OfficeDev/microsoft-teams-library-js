import * as React from 'react';

import { noHostSdkMsg } from '../../App';

export interface ApiWithTextInputProps<T> {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  onClick:
    | ((input: Partial<T>) => Promise<string>)
    | {
        validateInput: (input: Partial<T>) => void;
        submit: (input: T) => Promise<string>;
      };
  defaultInput?: string;
}

export const ApiWithTextInput = <T extends unknown>(props: ApiWithTextInputProps<T>): React.ReactElement => {
  const { name, defaultInput, onClick, title } = props;
  const [result, setResult] = React.useState('');
  const [input, setInput] = React.useState(defaultInput);

  const onClickCallback = React.useCallback(async () => {
    if (!input) {
      return;
    }

    setResult(noHostSdkMsg);
    try {
      const partialInput = JSON.parse(input) as Partial<T>;
      if (typeof onClick === 'function') {
        const result = await onClick(partialInput);
        setResult(result);
      } else {
        const { validateInput, submit } = onClick;
        validateInput(partialInput);
        const result = await submit(partialInput as T);
        setResult(result);
      }
    } catch (err) {
      setResult('Error: ' + err);
    }
  }, [input, setResult, onClick]);

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
      <input type="text" name={`input_${name}`} value={input} onChange={e => setInput(e.target.value)} />
      <input name={`button_${name}`} type="button" value={title} onClick={onClickCallback} />
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
