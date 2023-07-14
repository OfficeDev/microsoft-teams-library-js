import * as React from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiContainer } from './ApiContainer';
import { isTestBackCompat } from './isTestBackCompat';

export interface ApiWithCheckboxInputProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  label: string;
  onClick:
    | ((input: boolean, setResult: (result: string) => void) => Promise<string>)
    | {
        withPromise: (input: boolean, setResult: (result: string) => void) => Promise<string>;
        withCallback: (input: boolean, setResult: (result: string) => void) => string;
      };
  defaultCheckboxState?: boolean;
}

export const ApiWithCheckboxInput = (props: ApiWithCheckboxInputProps): React.ReactElement => {
  const { name, defaultCheckboxState = false, label, onClick, title } = props;
  const [result, setResult] = React.useState('');
  const [value, setValue] = React.useState(defaultCheckboxState);

  const onClickCallback = React.useCallback(async () => {
    setResult(noHostSdkMsg);

    try {
      if (typeof onClick === 'function') {
        const result = await onClick(value, setResult);
        setResult(result);
      } else {
        if (isTestBackCompat()) {
          const result = onClick.withCallback(value, setResult);
          setResult(result);
        } else {
          const result = await onClick.withPromise(value, setResult);
          setResult(result);
        }
      }
    } catch (err) {
      setResult('Error: ' + err);
    }
  }, [value, setResult, onClick]);

  return (
    <ApiContainer title={title} result={result} name={name}>
      <input name={`button_${name}`} type="button" value={title} onClick={onClickCallback} />
      {label}
      <input type="checkbox" name={label} onChange={(e) => setValue(e.target.checked)} placeholder={name} />
    </ApiContainer>
  );
};
