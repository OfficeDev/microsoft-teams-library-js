import React from 'react';

interface ApiWithCheckboxInputProps {
  title: string;
  name: string;
  onClick: (isChecked: boolean) => void;
  defaultCheckboxState?: boolean;
  label?: string; // Make label optional
}

export const ApiWithCheckboxInput: React.FC<ApiWithCheckboxInputProps> = ({
  title,
  name,
  onClick,
  defaultCheckboxState = false,
  label = '',
}) => {
  return (
    <div className="api-with-checkbox">
      <label>
        <input type="checkbox" name={name} defaultChecked={defaultCheckboxState} onChange={(e) => onClick(e.target.checked)} />
        {label && <span>{label}</span>}
      </label>
      <span>{title}</span>
    </div>
  );
};
