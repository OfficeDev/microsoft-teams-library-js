import React from 'react';
import { calendar } from '@microsoft/teams-js';
import { captureConsoleLogs } from './../components/sample/LoggerUtility';

const CalendarAPIs: React.FC = () => {
  const checkCalendarCapability = async () => {
    captureConsoleLogs((log) => console.log(log));
    console.log('Checking if Calendar module is supported...');
    const isSupported = calendar.isSupported();
    console.log(`Calendar module ${isSupported ? 'is' : 'is not'} supported`);
    return `Calendar module ${isSupported ? 'is' : 'is not'} supported`;
  };

  return (
    <div className="api-header">API: Calendar</div>
  );
};

export default CalendarAPIs;