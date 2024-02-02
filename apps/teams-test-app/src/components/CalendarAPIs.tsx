import { calendar } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';
import { removeAllWhitespace } from './utils/JsonStrings';

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
    onClick: async (input) => {
      await calendar.composeMeeting(input);
      return 'Completed';
    },
    defaultInput: removeAllWhitespace(`{
      "attendees": ["attendees"],
      "startTime": "startTime",
      "endTime": "endTime",
      "subject": "subject",
      "content": "content"
    }`),
  });

const OpenCalendarItem = (): React.ReactElement =>
  ApiWithTextInput<calendar.OpenCalendarItemParams>({
    name: 'openCalendarItem',
    title: 'Open CalendarItem',
    onClick: {
      submit: async (input) => {
        await calendar.openCalendarItem(input);
        return 'Completed';
      },
      validateInput: (x) => {
        if (!x.itemId) {
          throw new Error('itemId is required');
        }
      },
    },
    defaultInput: removeAllWhitespace(`{
      "itemId": "123"
    }`),
  });

const CalendarAPIs = (): ReactElement => (
  <ModuleWrapper title="Calendar">
    <CheckCalendarCapability />
    <ComposeMeeting />
    <OpenCalendarItem />
  </ModuleWrapper>
);

export default CalendarAPIs;
