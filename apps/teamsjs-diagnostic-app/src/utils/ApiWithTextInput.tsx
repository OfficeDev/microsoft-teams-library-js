import React, { useState } from 'react';
import ApiContainer from './ApiContainer';

interface ApiWithTextInputProps {
  title: string;
  name: string;
  onClick: (name: string, input: string) => void;
  defaultInput?: string;
}

export const ApiWithTextInput: React.FC<ApiWithTextInputProps> = ({ title, name, onClick, defaultInput = '' }) => {
  const [input, setInput] = useState(defaultInput);

  return (
    <ApiContainer title={title}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={() => onClick(name, input)}>Run API</button>
    </ApiContainer>
  );
};
