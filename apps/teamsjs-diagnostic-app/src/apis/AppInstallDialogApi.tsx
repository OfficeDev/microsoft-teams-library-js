import React, { useState } from 'react';
import { appInstallDialog } from '@microsoft/teams-js';
import { ApiWithTextInput } from '../utils/ApiWithTextInput';
import { ApiComponent } from '../components/sample/ApiComponents';

interface AppInstallDialogAPIsProps {
  apiComponent: ApiComponent;
  addToScenario: (api: ApiComponent, func: string, input?: string) => void;
}

const AppInstallDialogAPIs: React.FC<AppInstallDialogAPIsProps> = ({ apiComponent, addToScenario }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>(apiComponent.defaultInput || '');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFunction(event.target.value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const fillDefaultInput = () => {
    setInputValue(apiComponent.defaultInput || '');
  };

  const handleAddToScenario = () => {
    addToScenario(apiComponent, selectedFunction, inputValue);
  };

  return (
    <div className="api-container">
      <div className="api-header">{apiComponent.title}</div>
      <div className="dropdown-menu">
        <label htmlFor={`select-${apiComponent.name}`} className="sr-only">
          Select an option for {apiComponent.title}
        </label>
        <select id={`select-${apiComponent.name}`} className="box-dropdown" onChange={handleFunctionChange}>
          <option value="">Select a function</option>
          {apiComponent.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {selectedFunction && apiComponent.inputType === 'text' && (
          <div className="input-container">
            <input type="text" value={inputValue} onChange={handleInputChange} />
            <button onClick={fillDefaultInput}>Default</button>
          </div>
        )}
        <button onClick={handleAddToScenario}>Add to Scenario</button>
      </div>
    </div>
  );
};

export default AppInstallDialogAPIs;
