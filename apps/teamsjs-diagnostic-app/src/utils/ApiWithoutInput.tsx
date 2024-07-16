import React from 'react';
import ApiContainer from './ApiContainer';

interface ApiWithoutInputProps {
  title: string;
  name: string;
  onClick: (name: string) => void;
}

export const ApiWithoutInput: React.FC<ApiWithoutInputProps> = ({ title, name, onClick }) => {
  return (
    <ApiContainer title={title}>
      <button onClick={() => onClick(name)}>Run API</button>
    </ApiContainer>
  );
};
