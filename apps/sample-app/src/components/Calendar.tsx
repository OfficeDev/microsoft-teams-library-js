import './styles.css';

import { Button } from '@fluentui/react-components';
import { calendar } from '@microsoft/teams-js';
import React from 'react';

export const Calendar: React.FunctionComponent = () => {
  const handleCalendar = async (): Promise<void> => {
    // create calendar paramaters
    const calendarParams: calendar.ComposeMeetingParams = {
      attendees: ['t-abarthakur@microsoft.com'],
    };
    // send to 'compose meeting'
    await calendar.composeMeeting(calendarParams);
  };
  return (
    <div>
      <Button onClick={() => handleCalendar}>Add Meeting</Button>
    </div>
  );
};
