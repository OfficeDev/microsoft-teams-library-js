import './SingleInputForm.css';

import { useCallback, useState } from 'react';

import { noHostSdkMsg } from '../../../App';
import { Button } from '../Button.tsx/Button';
import { FormField } from '../FormField/FormField';
import { getTestBackCompat } from '../getTestBackCompat';
import { PrettyPrintJSON } from '../PrettyPrintJSON/PrettyPrintJSON';

export interface SingleInputFormProps {
  value: string;
  label: string;
  name: string;
  onClick:
    | ((input: string) => Promise<string>)
    | {
        validateInput: (input: string) => void;
        submit:
          | ((input: string, setResult: (result: string) => void) => Promise<string>)
          | {
              withPromise: (input: string, setResult: (result: string) => void) => Promise<string>;
              withCallback: (input: string, setResult: (result: string) => void) => void;
            };
      };
}

export const SingleInputForm = (props: SingleInputFormProps): JSX.Element => {
  const { value, label, onClick, name } = props;
  const [textInputValue, setTextInputValue] = useState(value);

  const [result, setResult] = useState('');
  const onClickHandler = useCallback(async () => {
    setResult(noHostSdkMsg);

    try {
      if (typeof onClick === 'function') {
        const result = await onClick(textInputValue);
        setResult(result);
      } else {
        const { validateInput, submit } = onClick;

        validateInput(textInputValue);

        if (typeof submit === 'function') {
          const result = await submit(textInputValue, setResult);
          setResult(result);
        } else {
          if (getTestBackCompat()) {
            submit.withCallback(textInputValue, setResult);
          } else {
            const result = await submit.withPromise(textInputValue, setResult);
            setResult(result);
          }
        }
      }
    } catch (err) {
      setResult('Error: ' + err);
    }
  }, [onClick, textInputValue]);

  const fieldChanged = (value: string): void => {
    setTextInputValue(value);
  };

  return (
    <>
      <div className="singleInputForm" id={`box_${name}`}>
        <>
          <FormField fieldChanged={fieldChanged} label={label} name={label} value={value} />

          <Button label="Submit" onClick={onClickHandler} />
        </>
        <>
          <PrettyPrintJSON name={name} label="Data" data={textInputValue} />
        </>
        <>
          <PrettyPrintJSON name={name} label="Result" data={result} />
        </>
      </div>
      <hr />
    </>
  );
};
