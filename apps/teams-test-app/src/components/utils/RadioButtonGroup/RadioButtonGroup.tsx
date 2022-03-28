import './RadioButtonGroup.css';

import { ChangeEvent, useCallback, useState } from 'react';

import { Button } from '../Button.tsx/Button';
import { FormWrapper } from '../FormWrapper/FormWrapper';
import { getTestBackCompat } from '../getTestBackCompat';
import { PrettyPrintJSON } from '../PrettyPrintJSON/PrettyPrintJSON';

export type RadioButtonGroupProps<T> = {
  buttonLabel: string;
  items: string[];
  label: string;
  name: string;
  onClick:
    | ((input: string | T) => Promise<string>)
    | {
        validateInput: (input: string | T) => void;
        submit:
          | ((input: T, setResult: (result: string) => void) => Promise<string>)
          | {
              withPromise: (input: T, setResult: (result: string) => void) => Promise<string>;
              withCallback: (input: T, setResult: (result: string) => void) => void;
            };
      };
};

export const RadioButtonGroup = <T,>(props: RadioButtonGroupProps<T>): JSX.Element => {
  const { buttonLabel, items, label, name, onClick } = props;
  const [result, setResult] = useState('');

  const [checked, setChecked] = useState(items[0]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const target = e.target;
    if (target.checked) {
      setChecked(target.value);
    }
  };

  const onClickHandler = useCallback(async () => {
    try {
      if (typeof onClick === 'function') {
        const result = await onClick(checked);
        setResult(result);
      } else {
        const { validateInput, submit } = onClick;
        const parsedInput = checked;
        validateInput(parsedInput);

        const input = (parsedInput as unknown) as T;
        if (typeof submit === 'function') {
          const result = await submit(input, setResult);
          setResult(result);
        } else {
          if (getTestBackCompat()) {
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
  }, [checked, onClick]);

  return (
    <FormWrapper name={name} className="radioGroupForm">
      <h3 className="radioFormLabel">{label}</h3>

      <div className="radioGroup">
        {items.map((item, i) => {
          return (
            <label key={`${name}-${i}`} className="radioLabel">
              <input type="radio" value={item} onChange={handleChange} checked={item === checked} />
              <span>{item}</span>
            </label>
          );
        })}
        <Button label={buttonLabel} onClick={onClickHandler} />
      </div>
      <PrettyPrintJSON name={name} label="Result" data={result} />
    </FormWrapper>
  );
};
