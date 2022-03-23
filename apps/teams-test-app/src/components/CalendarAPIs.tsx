import { calendar } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { SupportButton } from './utils/SupportButton/SupportButton';

const CheckCalendarCapability = (): React.ReactElement =>
  SupportButton({
    name: 'checkCalendarCapability',
    module: 'Calendar Capability',
    isSupported: calendar.isSupported(),
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
          throw new Error('itemId is required');
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
