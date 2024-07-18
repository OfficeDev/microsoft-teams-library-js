import { app, barCode } from '@microsoft/teams-js';
import { ApiComponent } from '../components/sample/ApiComponents';
import { useState } from 'react';
import { useDrag } from 'react-dnd';

export const barCode_checkBarCodeCapability = async (): Promise<string> => {
  try {
    console.log('Executing barCode_checkBarCodeCapability...');
    const result = `BarCode ${barCode.isSupported() ? 'is' : 'is not'} supported`;
    console.log('barCode_checkBarCodeCapability result:', result);
    return result;
  } catch (error) {
    console.log('Error in barCode_checkBarCodeCapability:', error);
    throw error;
  }
};

export const barCode_scanBarCode = async (input?: string): Promise<string> => {
  try {
    console.log('Executing barCode_scanBarCode with input:', input);
    if (!input) {
      throw new Error('BarCodeConfig is required');
    }

    const parsedInput = JSON.parse(input);
    console.log('Parsed input for barCode_scanBarCode:', parsedInput);

    const scannedCode = await barCode.scanBarCode(parsedInput);
    const result = JSON.stringify(scannedCode);
    console.log('barCode_scanBarCode result:', result);
    return result;
  } catch (error) {
    console.log('Error in barCode_scanBarCode:', error);
    throw error;
  }
};

export const barCode_hasBarCodePermission = async (): Promise<string> => {
  try {
    console.log('Executing barCode_hasBarCodePermission...');
    const result = await barCode.hasPermission();
    const resultString = JSON.stringify(result);
    console.log('barCode_hasBarCodePermission result:', resultString);
    return resultString;
  } catch (error) {
    console.log('Error in barCode_hasBarCodePermission:', error);
    throw error;
  }
};

export const barCode_requestBarCodePermission = async (): Promise<string> => {
  try {
    console.log('Executing barCode_requestBarCodePermission...');
    const result = await barCode.requestPermission();
    const resultString = JSON.stringify(result);
    console.log('barCode_requestBarCodePermission result:', resultString);
    return resultString;
  } catch (error) {
    console.log('Error in barCode_requestBarCodePermission:', error);
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
