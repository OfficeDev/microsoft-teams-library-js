import './utils.css';
import * as React from 'react';
import { noHostSdkMsg } from './../../components/App';
import { ApiContainer } from './ApiContainer';
import { isTestBackCompat } from './isTestBackCompat';

export interface ApiWithTextInputProps<T> {
  title: string;
  name: string;
  onClick: ((input: Partial<T>) => Promise<string>) | {
    validateInput: (input: Partial<T>) => void;
    submit: ((input: T, setResult: (result: string) => void) => Promise<string>) | {
      withPromise: (input: T, setResult: (result: string) => void) => Promise<string>;
      withCallback: (input: T, setResult: (result: string) => void) => void;
    };
  };
  defaultInput?: string;
}

export const ApiWithTextInput = <T,>(props: ApiWithTextInputProps<T>): React.ReactElement => {
  const { name, defaultInput, onClick, title } = props;
  const [result, setResult] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = React.useState('');

  const onDefaultCallback = React.useCallback(() => {
    setInputText(defaultInput ?? '');
  }, [defaultInput]);

  const onClickCallback = React.useCallback(async () => {
    if (!inputRef.current || !inputRef.current.value) return;
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
        const fullInput = partialInput as T;
        if (typeof submit === 'function') {
          const result = await submit(fullInput, setResult);
          setResult(result);
        } else {
          if (isTestBackCompat()) {
            submit.withCallback(fullInput, setResult);
          } else {
            const result = await submit.withPromise(fullInput, setResult);
            setResult(result);
          }
        }
      }
    } catch (err) {
      setResult('Error: ' + (err as Error).message);
    }
  }, [onClick]);

  return (
    <ApiContainer title={title} result={result} name={name}>
      <span className="apiWithTextInputHeader">
        <input type="text" name={`input_${name}`} value={inputText} ref={inputRef} placeholder={name} onChange={(e) => setInputText(e.target.value)} />
        <input name={`button_${name}`} type="button" value={title} onClick={onClickCallback} />
        <button name={`button_${name}_showDefault`} onClick={onDefaultCallback}>Default</button>
      </span>
    </ApiContainer>
  );
};