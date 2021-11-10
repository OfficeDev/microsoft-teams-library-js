import { calendar } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils/ApiWithoutInput';
import { ApiWithTextInput } from './utils/ApiWithTextInput';

const CheckCalendarCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityCalendar',
    title: 'Check Calendar Capability',
    onClick: () => `Calendar module ${calendar.isSupported() ? 'is' : 'is not'} supported`,
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

const CalendarAPIs = (): ReactElement => (
  <>
    <h1>calendar</h1>
    <CheckCalendarCapability />
    <ComposeMeeting />
    <OpenCalendarItem />
  </>
);

export default CalendarAPIs;
