import './ButtonForm.css';

import { useCallback, useState } from 'react';

import { noHostSdkMsg } from '../../../App';
import { Button } from '../Button.tsx/Button';
import { FormWrapper } from '../FormWrapper/FormWrapper';
import { getTestBackCompat } from '../getTestBackCompat';
import { PrettyPrintJSON } from '../PrettyPrintJSON/PrettyPrintJSON';

export type ButtonFormProps = {
  buttonLabel?: string;
  label: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  onClick:
    | ((setResult: (result: string) => void) => Promise<string>)
    | {
        withPromise: (setResult: (result: string) => void) => Promise<string>;
        withCallback: (setResult: (result: string) => void) => void;
      };
};

export const ButtonForm = (props: ButtonFormProps): JSX.Element => {
  const { onClick, label, name, buttonLabel } = props;
  const [result, setResult] = useState('');
  const onClickCallback = useCallback(async () => {
    setResult(label + noHostSdkMsg);

    try {
      if (typeof onClick === 'function') {
        const result = await onClick(setResult);
        setResult(result);
      } else {
        if (getTestBackCompat()) {
          onClick.withCallback(setResult);
        } else {
          setResult(await onClick.withPromise(setResult));
        }
      }
    } catch (err) {
      setResult('Error: ' + err);
    }
  }, [label, onClick]);

  return (
    <FormWrapper name={name} className="radioGroupForm">
      <h3 className="buttonFormLabel">{label}</h3>
      <div>
        <Button className="buttonFormButton" onClick={onClickCallback} label={buttonLabel || label} />
      </div>
      <PrettyPrintJSON name={name} data={result} label="Result" />
    </FormWrapper>
  );
};
