import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { calendar } from '@microsoft/teams-js';

const validateComposeMeetingInput = (config: any): boolean => {
  if (typeof config !== 'object' || Array.isArray(config)) {
    console.log('Validation failed: configuration should be an object.');
    return false;
  }
  if (config.startTime && isNaN(Date.parse(config.startTime))) {
    console.log('Validation failed: startTime is not a valid date.');
    return false;
  }
  if (config.endTime && isNaN(Date.parse(config.endTime))) {
    console.log('Validation failed: endTime is not a valid date.');
    return false;
  }
  if (config.attendees && !Array.isArray(config.attendees)) {
    console.log('Validation failed: attendees should be an array.');
    return false;
  }
  console.log('Validation passed.');
  return true;
};

export const calendar_CheckCalendarCapability = async () => {
  console.log(`Calendar module ${calendar.isSupported() ? 'is' : 'is not'} supported`);
}

export const calendar_OpenCalendarItem = async (input?: string) => {
  console.log('Executing openCalendarItem with input:', input);
  try {
    const openCalendarItemParams = input ? JSON.parse(input) : { itemId: '' };
    if (!openCalendarItemParams.itemId) {
      throw new Error('Item ID is required to open a calendar item');
    }
    await calendar.openCalendarItem(openCalendarItemParams);
    console.log('openCalendarItem executed successfully');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error occurred`);
    }
  }
};

export const calendar_ComposeMeeting = async (input?: string) => {
  console.log('Executing composeMeeting with input:', input);
  try {
    const composeMeetingParams = input ? JSON.parse(input) : {};
    if (!validateComposeMeetingInput(composeMeetingParams)) {
      throw new Error('Invalid meeting configuration');
    }
    await calendar.composeMeeting(composeMeetingParams);
    console.log('composeMeeting executed successfully');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error occurred`);
    }
  }
};

interface CalendarAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, func: string, input: string) => void;
}

const CalendarAPIs: React.FC<CalendarAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    if (selectedFunc === 'ComposeMeeting') {
      setInputValue(apiComponent.defaultInput || '');
    } else {
      setInputValue('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'API',
    item: () => ({
      api: apiComponent,
      func: selectedFunction,
      input: selectedFunction === 'ComposeMeeting' ? inputValue : '',
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [selectedFunction, inputValue]);

  const handleDrop = async () => {
    let result;
    try {
      if (selectedFunction === 'openCalendarItem') {
        await calendar_OpenCalendarItem(inputValue);
        result = 'openCalendarItem executed successfully';
      } else if (selectedFunction === 'ComposeMeeting') {
        await calendar_ComposeMeeting(inputValue);
        result = 'ComposeMeeting executed successfully';
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
        {selectedFunction === 'ComposeMeeting' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter input for ComposeMeeting"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarAPIs;
