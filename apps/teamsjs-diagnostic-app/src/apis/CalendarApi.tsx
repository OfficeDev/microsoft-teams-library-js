import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { calendar } from '@microsoft/teams-js';

export const calendar_CheckCalendarCapability = async () => {
  console.log('Executing CheckCalendarCapability...');
  return `Calendar module ${calendar.isSupported() ? 'is' : 'is not'} supported`;
};

export const calendar_ComposeMeeting = async (input?: string) => {
  console.log('Executing ComposeMeeting with input:', input);
  const parsedInput = input ? JSON.parse(input) : {};
  await calendar.composeMeeting(parsedInput);
  return 'ComposeMeeting called';
};

export const calendar_OpenCalendarItem = async (input?: string) => {
  console.log('Executing OpenCalendarItem with input:', input);
  const parsedInput = input ? JSON.parse(input) : {};
  await calendar.openCalendarItem(parsedInput);
  return 'OpenCalendarItem called';
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
