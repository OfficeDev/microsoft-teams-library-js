import './DynamicForm.css';

import { FormEvent, useState } from 'react';

import { FormField } from '../FormField/FormField';
import { PrettyPrintJSON } from '../PrettyPrintJSON/PrettyPrintJSON';

export type DynamicFormInputFields<T> = {
  [Property in keyof T]: { value: T[Property]; type: 'radio' | 'text' };
};
export type DynamicFormReturnValues<T> = {
  [Property in keyof T]:  T[Property];
};

export type DynamicFormProps<T> = {
  inputFields: DynamicFormInputFields<T>;
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
    let formValues = {}
    for(const k in values) {
      const value = values[k].value
      formValues = {...formValues, [k]: value}
    }

    

    return onSubmit(formValues as  DynamicFormReturnValues<T>)
      .then(result => {
        if (!result) {
          setSubmissionResult('Nothing to see here');
        } else {
          setSubmissionResult(result);
        }
      })
      .catch(err => console.log(err));
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
            {Object.entries(values).map(([key, value]: [key: string, value: {value: T[Property]}], index): JSX.Element => {
              return (
                <FormField
                  fieldChanged={fieldChanged}
                  label={`${key}`}
                  name={key}
                  value={`${value.value}`}
                  key={`${index}-${value}`}
                />
              );
            })}
            <button type="submit">Submit</button>
          </form>
        </>
        <>
          <PrettyPrintJSON name={name} label="Data" data={values} />
        </>
        <>
          <PrettyPrintJSON name={name} label="Result" data={submissionResult} />
        </>
      </div>
      <hr />
    </>
  );
};
