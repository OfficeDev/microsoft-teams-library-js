import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { dialog } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const dialog_CheckDialogCapability = async () => {
  console.log('Executing CheckDialogCapability...');
  try {
    dialog.isSupported();
    console.log(`Dialog capability is supported`);
    return `Dialog capability is supported`;
  } catch (error) {
    console.log('Error checking Dialog capability:', error);
    throw error;
  }
};
interface DialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, func: string, input: string) => void;
}

const DialogAPIs: React.FC<DialogAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFunction(event.target.value);
  };

  const { isDragging, drag } = useDragAndDrop('API', { api: apiComponent, func: selectedFunction});

  return (
    <div className="api-container" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="api-header">{apiComponent.title}</div>
      <div className="dropdown-menu">
        <select
          aria-label={`Select a function for ${apiComponent.title}`}
          className="box-dropdown"
          onChange={handleFunctionChange}
          value={selectedFunction}
        >
          <option value="">Select a function</option>
          {apiComponent.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DialogAPIs;
