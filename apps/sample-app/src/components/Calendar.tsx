import './styles.css';

import { Button } from '@fluentui/react-components';
import { app, calendar } from '@microsoft/teams-js';
import React from 'react';

const teamsDeepLinkHost = 'teams.microsoft.com';
const teamsDeepLinkProtocol = 'https';
const teamsDeepLinkAttendeesUrlParameterName = 'attendees';
const teamsDeepLinkUrlPathForCalendar = '/l/meeting/new';

export const handleNewMeeting = async (): Promise<void> => {
  if (!calendar.isSupported()) {
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
    const calendarParams: calendar.ComposeMeetingParams = {
      attendees: ['emailAdd@microsoft.com'],
    };
    await calendar.composeMeeting(calendarParams);
  }
};

export const CalendarCapability: React.FunctionComponent = () => {
  return (
    <div>
      <Button onClick={() => handleNewMeeting()}>Add Meeting</Button>
    </div>
  );
};
