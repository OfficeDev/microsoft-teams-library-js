import { barCode } from '@microsoft/teams-js';
import { ApiComponent } from '../components/sample/ApiComponents';
import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const barCode_CheckBarCodeCapability = async (): Promise<void> => {
  console.log('Executing CheckBarCodeCapability...');
  
  try {
    const result = barCode.isSupported();
    if (result) {
      console.log('BarCode capability is supported.');
    } else {
      console.log('BarCode capability is not supported.');
      throw new Error('BarCode capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking BarCode capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const barCode_ScanBarCode = async (config: barCode.BarCodeConfig = {}): Promise<string> => {
  console.log('Executing ScanBarCode with config:', JSON.stringify(config, null, 2));

  try {
    const scannedCode = await barCode.scanBarCode(config);
    console.log('Scanned code result:', scannedCode);
    return scannedCode;

  } catch (error) {
    console.log('Error scanning BarCode:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const barCode_HasBarCodePermission = async (): Promise<void> => {
  console.log('Executing HasBarCodePermission...');
  try {
    await barCode.hasPermission();
    console.log('BarCode permission has been granted.');
  } catch (error) {
    console.log('Error checking BarCode permission:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const barCode_RequestBarCodePermission = async (): Promise<void> => {
  console.log('Executing RequestBarCodePermission...');
  try {
    await barCode.requestPermission();
    console.log('BarCode permission request successful.');
  } catch (error) {
    console.log('Error requesting BarCode permission:', JSON.stringify(error, null, 2));
    throw error;
  }
};

interface BarCodeAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const BarCodeAPIs: React.FC<BarCodeAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const { isDragging, drag } = useDragAndDrop('API', { api: apiComponent, func: selectedFunction, input: inputValue });

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
        {selectedFunction === 'ScanBarCode' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter barcode configuration"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarCodeAPIs;
