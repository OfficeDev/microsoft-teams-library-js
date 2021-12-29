import * as React from 'react';

import { ApiContainer } from './ApiContainer';
import { getTestBackCompat } from './getTestBackCompat';

export interface ApiWithoutInputProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  onClick:
    | ((setResult: (result: string) => void) => Promise<string>)
    | {
        withPromise: (setResult: (result: string) => void) => Promise<string>;
        withCallback: (setResult: (result: string) => void) => string;
      };
}

export const ApiWithoutInput = (props: ApiWithoutInputProps): React.ReactElement => {
  const { name, onClick, title } = props;
  const [result, setResult] = React.useState('');

  return (
    <ApiContainer title={title} result={result} name={name}>
      <input
        name={`button_${name}`}
        type="button"
        value={title}
        onClick={async () => {
          if (typeof onClick == 'function') {
            setResult(await onClick(setResult));
          } else {
            if (getTestBackCompat()) {
              setResult(onClick.withCallback(setResult));
            } else {
              setResult(await onClick.withPromise(setResult));
            }
          }
        }}
      />
    </ApiContainer>
  );
};
