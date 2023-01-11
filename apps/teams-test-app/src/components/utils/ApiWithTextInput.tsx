import * as React from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiContainer } from './ApiContainer';
import { isTestBackCompat } from './isTestBackCompat';

export interface ApiWithTextInputProps<T> {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces at all
  onClick:
    | ((input: Partial<T>) => Promise<string>)
    | {
        validateInput: (input: Partial<T>) => void;
        submit:
          | ((input: T, setResult: (result: string) => void) => Promise<string>)
          | {
              withPromise: (input: T, setResult: (result: string) => void) => Promise<string>;
              withCallback: (input: T, setResult: (result: string) => void) => void;
            };
      };
  defaultInput?: string;
}

export const ApiWithTextInput = <T extends unknown>(props: ApiWithTextInputProps<T>): React.ReactElement => {
  const { name, defaultInput, onClick, title } = props;
  const [result, setResult] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onClickCallback = React.useCallback(async () => {
    if (!inputRef || !inputRef.current || !inputRef.current.value) {
      return;
    }

    const input = inputRef.current.value;
    setResult(noHostSdkMsg);
    try {
      const partialInput = JSON.parse(input) as Partial<T>;
      if (typeof onClick === 'function') {
        const result = await onClick(partialInput);
        setResult(result);
      } else {
        const { validateInput, submit } = onClick;
        validateInput(partialInput);
        const input = partialInput as T;
        if (typeof submit === 'function') {
          const result = await submit(input, setResult);
          setResult(result);
        } else {
          if (isTestBackCompat()) {
            submit.withCallback(input, setResult);
          } else {
            const result = await submit.withPromise(input, setResult);
            setResult(result);
          }
        }
      }
    } catch (err) {
      setResult('Error: ' + err);
    }
  }, [inputRef, setResult, onClick]);

  return (
    <ApiContainer title={title} result={result} name={name}>
      <span>
        <input type="text" name={`input_${name}`} defaultValue={defaultInput} ref={inputRef} placeholder={name} />
        <input name={`button_${name}`} type="button" value={title} onClick={onClickCallback} />
      </span>
    </ApiContainer>
  );
};
