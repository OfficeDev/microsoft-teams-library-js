import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { calendar } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

export const calendar_CheckCalendarCapability = async (): Promise<void> => {
  const module = calendar;
  const moduleName = 'Calendar';
  const supportedMessage = 'Calendar module is supported. Calendar is supported on Outlook Web, Outlook Desktop, and Outlook Mobile.';
  const notSupportedMessage = 'Calendar module is not supported. Calendar is only supported on the following platforms: Outlook Web, Outlook Desktop, and Outlook Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
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

const functionsRequiringInput = [
  'ComposeMeeting', 
  'OpenCalendarItem', 
]; // List of functions requiring input

interface CalendarAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const CalendarAPIs: React.FC<CalendarAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default CalendarAPIs;;
