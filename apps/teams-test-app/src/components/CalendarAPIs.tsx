import { calendar } from '@microsoft/teams-js';
import { ForwardedRef, forwardRef, ReactElement } from 'react';

import { DynamicForm } from './utils/DynamicForm/DynamicForm';
import { SupportButton } from './utils/SupportButton/SupportButton';

const composeMeeting = async (input: calendar.ComposeMeetingParams): Promise<string> => {
  const meeting = await calendar.composeMeeting(input).catch(err => {
    return err;
  });
  return `Result: ${meeting}`;
};

const openCalendarItem = async (input: calendar.OpenCalendarItemParams): Promise<string | void> => {
  if (!input.itemId) {
    throw new Error('itemId is required');
  }
  return await calendar.openCalendarItem(input);
};

const ComposeMeeting = (): ReactElement => (
  <DynamicForm
    name="composeMeeting"
    onSubmit={composeMeeting}
    label="Compose Meeting 2"
    inputFields={{ attendees: ['Nico', 'Ash'], startTime: 'Now', endTime: '2:00', subject: 'Im an Event' }}
  />
);
const OpenCalendarItem = (): ReactElement => (
  <DynamicForm
    name="openCalendarItem"
    onSubmit={openCalendarItem}
    label="Open Calendar Item"
    inputFields={{ itemId: '1' }}
  />
);

const CheckCalendarCapability = (): ReactElement =>
  SupportButton({
    name: 'checkCalendarCapability',
    module: 'Calendar Capability',
    isSupported: calendar.isSupported(),
  });

const CalendarAPIs = forwardRef(
  (_props, ref: ForwardedRef<HTMLDivElement>): ReactElement => (
    <div className="module" ref={ref}>
      <h1>calendar</h1>
      <CheckCalendarCapability />
      <ComposeMeeting />
      <OpenCalendarItem />
    </div>
  ),
);

CalendarAPIs.displayName = 'CalendarAPIs';

export default CalendarAPIs;
