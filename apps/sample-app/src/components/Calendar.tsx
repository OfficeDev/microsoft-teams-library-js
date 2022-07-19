import './styles.css';

import { Button } from '@fluentui/react-components';
import { app, calendar } from '@microsoft/teams-js';
import React from 'react';

import { MessageListItem } from './Emails';

const teamsDeepLinkHost = 'teams.microsoft.com';
const teamsDeepLinkProtocol = 'https';
const teamsDeepLinkAttendeesUrlParameterName = 'attendees';
const teamsDeepLinkUrlPathForCalendar = '/l/meeting/new';

export const handleNewMail = async (): Promise<void> => {
  if (!calendar.isSupported()) {
    const context = await app.getContext();
    if (context?.app?.host?.name === 'Teams') {
      const calendarParams: calendar.ComposeMeetingParams = {
        attendees: ['emailAddress@microsoft.com'],
      };
      const attendeeSearchParameter =
        calendarParams.attendees === undefined
          ? ''
          : `${teamsDeepLinkAttendeesUrlParameterName}=` +
            calendarParams.attendees.map(attendee => encodeURIComponent(attendee)).join(',');

      const deepLinkUrl = `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${teamsDeepLinkUrlPathForCalendar}?${attendeeSearchParameter}`;
      app.openLink(deepLinkUrl);
    } else {
      alert('compose new meeting is not supported');
    }
  } else {
    const calendarParams: calendar.ComposeMeetingParams = {
      attendees: ['emailAdd@microsoft.com'],
    };
    await calendar.composeMeeting(calendarParams);
  }
};

export const handleOpenMail = async (e: MessageListItem): Promise<void> => {
  if (!calendar.isSupported()) {
    alert('open mail item is not supported');
  } else {
    const openMailParams: calendar.OpenCalendarItemParams = {
      itemId: e.key || '',
    };
    const result = await calendar.openCalendarItem(openMailParams);
    return alert(result);
  }
};
export const CalendarCapability: React.FunctionComponent = () => {
  return (
    <div>
      <Button onClick={() => handleNewMail()}>Add Meeting</Button>
    </div>
  );
};
