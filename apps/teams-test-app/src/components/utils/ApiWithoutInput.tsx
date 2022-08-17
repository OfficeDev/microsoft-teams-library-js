import * as React from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiContainer } from './ApiContainer';
import { isTestBackCompat } from './isTestBackCompat';

export interface ApiWithoutInputProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  onClick:
    | ((setResult: (result: string) => void) => Promise<string>)
    | {
        withPromise: (setResult: (result: string) => void) => Promise<string>;
        withCallback: (setResult: (result: string) => void) => void;
      };
}

export const ApiWithoutInput = (props: ApiWithoutInputProps): React.ReactElement => {
  const { name, onClick, title } = props;
  const [result, setResult] = React.useState('');
  const onClickCallback = React.useCallback(async () => {
    setResult(noHostSdkMsg);
    try {
      if (typeof onClick === 'function') {
        setResult(await onClick(setResult));
      } else {
        if (isTestBackCompat()) {
          onClick.withCallback(setResult);
        } else {
          setResult(await onClick.withPromise(setResult));
        }
      }
    } catch (err) {
      setResult('Error: ' + err);
    }
  }, [setResult, onClick]);

  return (
    <ApiContainer title={title} result={result} name={name}>
      <input
        name={`button_${name}`}
        style={{ width: 'fit-content' }}
        type="button"
        value={title}
        onClick={onClickCallback}
      />
    </ApiContainer>
  );
};
