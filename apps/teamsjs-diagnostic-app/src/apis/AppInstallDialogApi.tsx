import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';

interface AppInstallDialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, selectedFunction: string, inputValue: string) => void;
}

const AppInstallDialogAPIs: React.FC<AppInstallDialogAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'API',
    item: {
      api: apiComponent,
      func: selectedFunction,
      input: selectedFunction === 'OpenAppInstallDialog' ? inputValue : '',
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    if (selectedFunc === 'OpenAppInstallDialog') {
      setInputValue(apiComponent.defaultInput || '');
    } else {
      setInputValue('');
    }
  };

  return (
    <div className="api-container" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="api-header">{apiComponent.title}</div>
      <div className="api-body">
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
        {selectedFunction && selectedFunction === 'OpenAppInstallDialog' && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter input value"
          />
        )}
      </div>
    </div>
  );
};

export default AppInstallDialogAPIs;
