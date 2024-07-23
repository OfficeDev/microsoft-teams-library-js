import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { calendar } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const calendar_CheckCalendarCapability = async (): Promise<void> => {
  console.log('Executing CheckCalendarCapability...');
  try {
    const result = await calendar.isSupported();
    if (result) {
      console.log('Calendar capability is supported.');
    } else {
      console.log('Calendar capability is not supported. Calendar is only supported on the following platforms: Outlook Web, Outlook Desktop, and Outlook Mobile.');
      throw new Error('Calendar capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Calendar capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
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
    console.log('Calendar is only supported on the following platforms: Outlook Web, Outlook Desktop, and Outlook Mobile.');
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
    console.log('Calendar is only supported on the following platforms: Outlook Web, Outlook Desktop, and Outlook Mobile.');
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

  const functionsRequiringInput = ['ComposeMeeting', 'OpenCalendarItem'];

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
          {apiComponent.functions.map((func, index) => (
            <option key={index} value={func.name}>
              {func.name}
            </option>
          ))}
        </select>
        {selectedFunction && functionsRequiringInput.includes(selectedFunction) && (
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
