import { app, barCode } from '@microsoft/teams-js';
import { ApiComponent } from '../components/sample/ApiComponents';
import { useState } from 'react';
import { useDrag } from 'react-dnd';

const validateScanBarCodeInput = (config: any): boolean => {
  if (typeof config !== 'object' || Array.isArray(config)) {
    console.log('Validation failed: configuration should be an object.');
    return false;
  }
  if (config.timeOutIntervalInSec && (typeof config.timeOutIntervalInSec !== 'number' || config.timeOutIntervalInSec < 1 || config.timeOutIntervalInSec > 60)) {
    console.log('Validation failed: timeout interval should be a number between 1 and 60.');
    return false;
  }
  console.log('Validation passed.');
  return true;
};

export const barCode_HasBarCodePermission = async () => {
  console.log('Executing CheckPermission...');
  try {
    const hasPermission = await barCode.hasPermission();
    console.log(`Permission status: ${hasPermission ? 'Granted' : 'Denied'}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error occurred`);
    }
  }
};

export const barCode_RequestBarCodePermission = async () => {
  console.log('Executing RequestPermission...');
  try {
    const isPermissionGranted = await barCode.requestPermission();
    console.log(`Permission request result: ${isPermissionGranted ? 'Granted' : 'Denied'}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error occurred`);
    }
  }
};

export const barCode_ScanBarCode = async (input?: string) => {
  console.log('Executing ScanBarCode with input:', input);
  try {
    const barCodeConfig = input ? JSON.parse(input) : {};
    if (!validateScanBarCodeInput(barCodeConfig)) {
      throw new Error('Invalid barcode configuration');
    }
    console.log('Parsed barcode configuration:', barCodeConfig);
    const scannedCode = await barCode.scanBarCode(barCodeConfig);
    console.log(`Scanned barcode: ${scannedCode}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error occurred`);
    }
  }
};

interface BarCodeAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, func: string, result: string) => void;
}

const BarCodeAPIs: React.FC<BarCodeAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    if (selectedFunc === 'scanBarCode') {
      setInputValue(apiComponent.defaultInput || '');
    } else {
      setInputValue('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'API',
    item: () => ({
      api: apiComponent,
      func: selectedFunction,
      input: selectedFunction === 'scanBarCode' ? inputValue : '',
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [selectedFunction, inputValue]);

  const handleDrop = async () => {
    let result;
    try {
      if (selectedFunction === 'CheckPermission') {
        await barCode_HasBarCodePermission
        result = 'CheckPermission executed successfully';
      } else if (selectedFunction === 'RequestPermission') {
        await barCode_RequestBarCodePermission
        result = 'RequestPermission executed successfully';
      } else if (selectedFunction === 'scanBarCode') {
        await barCode_ScanBarCode(inputValue);
        result = 'scanBarCode executed successfully';
      } else {
        result = 'Function not implemented';
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        result = `Error: ${error.message}`;
      } else {
        result = 'Unknown error occurred';
      }
    }
    onDropToScenarioBox(apiComponent, selectedFunction, result);
  };

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
        {selectedFunction === 'scanBarCode' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter barcode configuration JSON"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarCodeAPIs;
