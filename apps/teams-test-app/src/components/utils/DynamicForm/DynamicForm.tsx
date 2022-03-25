import './DynamicForm.css';

import { FormEvent, useState } from 'react';

import { FormField } from '../FormField/FormField';
import { PrettyPrintJSON } from '../PrettyPrintJSON/PrettyPrintJSON';

export type DynamicFormProps<T> = {
  inputFields: T;
  label: string;
  onSubmit: (inputFields: T) => Promise<string | void>;
  name: string;
};

// comma in generic is needed if in a TSX file
export const DynamicForm = <T,>(props: DynamicFormProps<T>): JSX.Element => {
  const { inputFields, label, onSubmit, name } = props;
  const [values, setValues] = useState(inputFields);
  const [submissionResult, setSubmissionResult] = useState('');

  const submitForm = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await onSubmit(values).then(result => {
      if (!result) {
        setSubmissionResult('done');
      } else {
        setSubmissionResult(result);
      }
    });
  };

  const fieldChanged = (fieldName, value): void => {
    setValues({ ...values, [fieldName]: value });
  };

  return (
    <>
      <div className="dynamicForm" id={`box_${name}`}>
        <h4 className="dynamicFormHeader">{label}</h4>
        <>
          <form onSubmit={submitForm}>
            {Object.entries(values).map(([key, value], index) => {
              return (
                <FormField fieldChanged={fieldChanged} label={key} name={key} value={value} key={`${index}-${key}`} />
              );
            })}
            <button type="submit">Submit</button>
          </form>
        </>
        <>
          <PrettyPrintJSON label="Data" data={values} />
        </>
        <>
          <PrettyPrintJSON label="Result" data={submissionResult} />
        </>
      </div>
      <hr />
    </>
  );
};
