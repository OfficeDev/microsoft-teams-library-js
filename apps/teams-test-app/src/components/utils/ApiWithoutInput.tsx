import * as React from 'react';

import { ApiContainer } from './ApiContainer';

export interface ApiWithoutInputProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  onClick: (setResult: (result: string) => void) => Promise<string>;
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
        onClick={async () => setResult(await onClick(setResult))}
      />
    </ApiContainer>
  );
};
