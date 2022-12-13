import { Text, Title3 } from '@fluentui/react-components';
import { AuthProvider, AuthProviderCallback, Client, Options } from '@microsoft/microsoft-graph-client';
import { Calendar, Message, User } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { CalendarCapability } from './Calendar';
import { EmailList } from './Emails';
import { MainPage } from './MainPage';
import { MeetingList } from './Meetings';
import { PagesCapability } from './Pages';
import { PeopleAvatarList } from './PeopleAvatars';
import { getDates } from './utils';

interface ProfileContentProps {
  accessToken: string;
}

export const ProfileContent: React.FC<ProfileContentProps> = (props: ProfileContentProps) => {
  const { accessToken } = props;
  const [userInfo, setUserInfo] = React.useState<User>();
  const [calendar, setCalendar] = React.useState<Calendar>();
  const [emails, setEmails] = React.useState<Message[]>();
  React.useEffect(() => {
    (async () => {
      const authProvider: AuthProvider = (callback: AuthProviderCallback) => {
        callback(undefined, accessToken);
      };
      const options: Options = { authProvider };
      const client = Client.init(options);
      // get User Profile Info
      const userResponse = await client.api('/me').get();
      setUserInfo(userResponse);

      // get Calendar Meeting Info
      const [currDate, tomorrowDate] = getDates();
      const calendarResponse = await client
        .api('/me/calendarview?startdatetime=' + currDate + '&enddatetime=' + tomorrowDate)
        .get();
      const calendar = calendarResponse as Calendar;
      setCalendar(calendar);
      // get recent emails
      const emailResponse = await client.api('/me/messages').top(5).get();
      const emails = emailResponse.value as Message[];
      setEmails(emails);
    })();
  }, [accessToken, setUserInfo, setCalendar, setEmails]);

  return (
    <>
      {!userInfo ? <p>loading user info...</p> : <MainPage userInfo={userInfo} />}
      {!calendar ? (
        <Text as="p"> loading meeting info..</Text>
      ) : (
        <>
          <div className="flex-container">
            <div className="column">
              <MeetingList messages={calendar['value']} />
            </div>
            <div className="column">
              {!userInfo ? <p> getting info </p> : <PeopleAvatarList messages={calendar['value']} user={userInfo} />}
            </div>
          </div>
          <div className="flex-container">
            <div className="column">{emails && <EmailList messages={emails} />}</div>
            <div className="column">
              <Title3 className="paddingClass">Other Features</Title3>
              <div className="flex-container">
                <div className="column">
                  <CalendarCapability />
                </div>
                <PagesCapability />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
