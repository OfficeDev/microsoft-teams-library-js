import React, { ReactElement } from 'react';
import { calendar } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const CalendarAPIs = (): ReactElement => {
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');
  const [composeMeetingRes, setComposeMeetingRes] = React.useState('');
  const [openCalendarItemRes, setOpenCalendarItemRes] = React.useState('');

  const composeMeeting = (meetingParams: string): void => {
    setComposeMeetingRes('calendar.composeMeeting()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setComposeMeetingRes(reason);
      } else {
        setComposeMeetingRes('Completed');
      }
    };
    calendar.composeMeeting(JSON.parse(meetingParams), onComplete);
  };

  const openCalendarItem = (calendarParams: string): void => {
    setOpenCalendarItemRes('calendar.openCalendarItem()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setOpenCalendarItemRes(reason);
      } else {
        setOpenCalendarItemRes('Completed');
      }
    };
    calendar.openCalendarItem(JSON.parse(calendarParams), onComplete);
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
