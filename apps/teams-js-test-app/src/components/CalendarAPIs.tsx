import { calendar } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const CalendarAPIs = (): ReactElement => {
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');
  const [composeMeetingRes, setComposeMeetingRes] = React.useState('');
  const [openCalendarItemRes, setOpenCalendarItemRes] = React.useState('');

  const composeMeeting = (meetingParams: string): void => {
    setComposeMeetingRes('calendar.composeMeeting()' + noHubSdkMsg);
    calendar
      .composeMeeting(JSON.parse(meetingParams))
      .then(() => setComposeMeetingRes('Completed'))
      .catch(reason => setComposeMeetingRes(reason));
  };

  const openCalendarItem = (calendarParams: string): void => {
    setOpenCalendarItemRes('calendar.openCalendarItem()' + noHubSdkMsg);
    calendar
      .openCalendarItem(JSON.parse(calendarParams))
      .then(() => setOpenCalendarItemRes('Completed'))
      .catch(reason => setOpenCalendarItemRes(reason));
  };

  const checkCalendarCapability = (): void => {
    if (calendar.isSupported()) {
      setCapabilityCheckRes('Calendar module is supported');
    } else {
      setCapabilityCheckRes('Calendar module is not supported');
    }
  };

  return (
    <>
      <h1>calendar</h1>
      <BoxAndButton
        handleClick={checkCalendarCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Capability Calendar"
        name="checkCapabilityCalendar"
      />
      <BoxAndButton
        handleClickWithInput={openCalendarItem}
        output={openCalendarItemRes}
        hasInput={true}
        title="Open Calendar Item"
        name="openCalendarItem"
      />
      <BoxAndButton
        handleClickWithInput={composeMeeting}
        output={composeMeetingRes}
        hasInput={true}
        title="Compose Meeting"
        name="composeMeeting"
      />
    </>
  );
};

export default CalendarAPIs;
