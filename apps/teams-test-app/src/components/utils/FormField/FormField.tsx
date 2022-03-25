import './FormField.css';

import { ChangeEvent } from 'react';

export type FormFieldProps = {
  fieldChanged: (field: string, value: string) => void;
  label: string;
  name: string;
  value: string;
};

export const FormField = (props: FormFieldProps): JSX.Element => {
  const { fieldChanged, label, name, value } = props;

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    fieldChanged(name, e.target.value);
  };

  return (
    <div className="formField">
      <label htmlFor={name}>{label}</label>
      <input type="text" value={value} onChange={onChange} />
    </div>
  );
};
