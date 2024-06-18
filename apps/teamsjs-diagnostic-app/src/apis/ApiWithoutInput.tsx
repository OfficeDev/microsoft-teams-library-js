//EXPAND ON THIS FILE LATER
import React from 'react';

interface ApiWithoutInputProps {
  name: string;
  title: string;
  onClick: () => Promise<string>;
}

export function ApiWithoutInput({ name, title, onClick }: ApiWithoutInputProps): React.ReactElement {
  const handleButtonClick = async () => {
    try {
      const result = await onClick();
      console.log(`${title} executed successfully: ${result}`);
    } catch (err) {
      console.error(`Failed to execute ${title}:`, err);
    }
  };

  return (
    <div>
      <h3>{title}</h3>
      <button onClick={handleButtonClick}>Execute</button>
    </div>
  );
}
