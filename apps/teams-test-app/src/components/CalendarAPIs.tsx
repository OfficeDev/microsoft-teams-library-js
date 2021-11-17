import { calendar } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import BoxAndButton from './BoxAndButton';
import { ApiWithoutInput, ApiWithTextInput } from './utils';

const CheckCalendarCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCalendarCapability',
    title: 'Check Calendar Capability',
    onClick: async () => `Calendar module ${calendar.isSupported() ? 'is' : 'is not'} supported`,
  });

const ComposeMeeting = (): React.ReactElement =>
  ApiWithTextInput<calendar.ComposeMeetingParams>({
    name: 'composeMeeting',
    title: 'Compose Meeting',
    onClick: async input => {
      await calendar.composeMeeting(input);
      return 'Completed';
    },
  });

const OpenCalendarItem = (): React.ReactElement =>
  ApiWithTextInput<calendar.OpenCalendarItemParams>({
    name: 'openCalendarItem',
    title: 'Open CalendarItem',
    onClick: {
      submit: async input => {
        await calendar.openCalendarItem(input);
        return 'Completed';
      },
      validateInput: x => {
        if (!x.itemId) {
          throw 'itemId is required';
        }
      },
    },
  });

const CalendarAPIs = (): ReactElement => {
  // TODO: Remove once E2E scenario tests are updated to use the new version
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  // TODO: Remove once E2E scenario tests are updated to use the new version
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
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClick={checkCalendarCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Capability Calendar"
        name="checkCapabilityCalendar"
      />
      <CheckCalendarCapability />
      <ComposeMeeting />
      <OpenCalendarItem />
    </>
  );
};

export default CalendarAPIs;
