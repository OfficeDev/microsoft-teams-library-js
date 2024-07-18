import { app, barCode } from '@microsoft/teams-js';
import { ApiComponent } from '../components/sample/ApiComponents';
import { useState } from 'react';
import { useDrag } from 'react-dnd';

export const barCode_checkBarCodeCapability = async () => {
  console.log('Executing barCode_checkBarCodeCapability...');
  const result = `BarCode ${barCode.isSupported() ? 'is' : 'is not'} supported`;
  console.log('barCode_checkBarCodeCapability result:', result);
  return result;
};

export const barCode_scanBarCode = async (input?: string) => {
  console.log('Executing barCode_scanBarCode with input:', input);
  if (!input) {
    console.error('Error: BarCodeConfig is required');
    throw new Error('BarCodeConfig is required');
  }

  let parsedInput: barCode.BarCodeConfig;
  try {
    parsedInput = JSON.parse(input);
    console.log('Parsed input for barCode_scanBarCode:', parsedInput);
  } catch (error) {
    console.error('Error parsing input for barCode_scanBarCode:', error);
    throw error;
  }

  // Ensure parsedInput conforms to BarCodeConfig
  if (!parsedInput || typeof parsedInput !== 'object') {
    console.error('Error: Parsed input is not a valid BarCodeConfig');
    throw new Error('Parsed input is not a valid BarCodeConfig');
  }

  try {
    console.log('Calling barCode.scanBarCode with parsed input:', JSON.stringify(parsedInput, null, 2));
    const scannedCode = await barCode.scanBarCode(parsedInput);
    const result = JSON.stringify(scannedCode);
    console.log('barCode_scanBarCode result:', result);
    return result;
  } catch (error) {
    console.error('Error in barCode_scanBarCode:', error);
    throw error;
  }
};

export const barCode_hasBarCodePermission = async (): Promise <string> => {
  console.log('Executing barCode_hasBarCodePermission...');
  try {
    const result = await barCode.hasPermission();
    const resultString = JSON.stringify(result);
    console.log('barCode_hasBarCodePermission result:', resultString);
    return resultString;
  } catch (error) {
    console.log('Inside catch');
    console.log('Error in barCode_hasBarCodePermission:', error);
    throw error;
  }
};

export const barCode_requestBarCodePermission = async () => {
  console.log('Executing barCode_requestBarCodePermission...');
  try {
    const result = await barCode.requestPermission();
    const resultString = JSON.stringify(result);
    console.log('barCode_requestBarCodePermission result:', resultString);
    return resultString;
  } catch (error) {
    console.error('Error in barCode_requestBarCodePermission:', error);
    throw error;
  }
};

interface BarCodeAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, func: string, input: string) => void;
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
              placeholder="Enter text input for scanBarCode"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarCodeAPIs;
