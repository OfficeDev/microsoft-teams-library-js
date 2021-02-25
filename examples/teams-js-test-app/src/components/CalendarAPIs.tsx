import React from 'react';
import { calendar } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const CalendarAPIs = () => {
  const [calendarCapabilityCheck, setCalendarCapabilityCheck] = React.useState("");
  const [openCalendarItem, setOpenCalendarItem] = React.useState("");
  const [composeMeeting, setComposeMeeting] = React.useState("");

  const returnComposeMeeting = (meetingParams: any) => {
    setComposeMeeting("calendar.composeMeeting()" + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string) => {
      if (!status) {
        if (reason) setComposeMeeting(reason);
      } else {
        setComposeMeeting('Completed');
      }
    };
    calendar.composeMeeting(JSON.parse(meetingParams), onComplete);
  };
  const returnOpenCalendarItem = (calendarParams: any) => {
    setOpenCalendarItem("calendar.openCalendarItem()" + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string) => {
      if (!status) {
        if (reason) setOpenCalendarItem(reason);
      } else {
        setOpenCalendarItem('Completed');
      }
    };
    calendar.openCalendarItem(JSON.parse(calendarParams), onComplete);
  };

  const returnCheckCalendarCapability = () => {
    if (calendar.isSupported()) {
      setCalendarCapabilityCheck('Calendar module is supported');
    } else {
      setCalendarCapabilityCheck('Calendar module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnCheckCalendarCapability}
        output={calendarCapabilityCheck}
        hasInput={false}
        title="Check Capability Calendar"
        name="checkCapabilityCalendar"
      />
      <BoxAndButton
        handleClick={returnOpenCalendarItem}
        output={openCalendarItem}
        hasInput={true}
        title="Open Calendar Item"
        name="openCalendarItem"
      />
      <BoxAndButton
        handleClick={returnComposeMeeting}
        output={composeMeeting}
        hasInput={true}
        title="Compose Meeting"
        name="composeMeeting"
      />
    </>
  );
};

export default CalendarAPIs;
