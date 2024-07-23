import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { calendar } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const calendar_CheckCalendarCapability = async (): Promise<string> => {
  console.log('Executing CheckCalendarCapability...');
  try {
    calendar.isSupported();
    console.log(`Calendar capability is supported`);
    return `Calendar capability is supported`;
  } catch (error) {
    console.log('Error checking Calendar capability:', error);
    throw error;
  }
};

export const calendar_ComposeMeeting = async (input: string): Promise<string> => {
  console.log('Executing ComposeMeeting with input:', input);
  try {
    const meetingDetails = JSON.parse(input);
    await calendar.composeMeeting(meetingDetails);
    console.log('Meeting composed successfully.');
    return 'Completed';
  } catch (error) {
    console.log('Error composing meeting:', error);
    throw error;
  }
};

export const calendar_OpenCalendarItem = async (input: string): Promise<string> => {
  console.log('Executing OpenCalendarItem with input:', input);
  try {
    const calendarItemDetails = JSON.parse(input);
    if (!calendarItemDetails.itemId) {
      throw new Error('itemId is required');
    }
    await calendar.openCalendarItem(calendarItemDetails);
    console.log('Calendar item opened successfully.');
    return 'Completed';
  } catch (error) {
    console.log('Error opening calendar item:', error);
    throw error;
  }
};

interface CalendarAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const CalendarAPIs: React.FC<CalendarAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');  // Set the input value to an empty string initially
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleDefaultButtonClick = () => {
    if (selectedFunction && apiComponent.defaultInput) {
      const defaultInputs = JSON.parse(apiComponent.defaultInput);
      setInputValue(defaultInputs[selectedFunction] ? JSON.stringify(defaultInputs[selectedFunction]) : '');
    }
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
        {selectedFunction && apiComponent.inputType === 'text' && selectedFunction !== 'CheckCalendarCapability' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Enter input for ${selectedFunction}`}
            />
            <button onClick={handleDefaultButtonClick}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarAPIs;
