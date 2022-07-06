import { Text } from '@fluentui/react-components';
import { AuthProvider, AuthProviderCallback, Client, Options } from '@microsoft/microsoft-graph-client';
import { Calendar, User } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { MainPage } from './MainPage';
import { MeetingList } from './Meetings';
import { PeopleAvatarList } from './PeopleAvatars';

interface ProfileContentProps {
  accessToken: string;
}

export const ProfileContent: React.FC<ProfileContentProps> = (props: ProfileContentProps) => {
  const { accessToken } = props;
  const [userInfo, setUserInfo] = React.useState<User>();
  const [calendar, setCalendar] = React.useState<Calendar>();

  React.useEffect(() => {
    (async () => {
      const authProvider: AuthProvider = (callback: AuthProviderCallback) => {
        callback(undefined, accessToken);
      };
      console.log('starting info');
      const options: Options = { authProvider };
      const client = Client.init(options);
      // User Profile Info
      const userResponse = await client.api('/me').get();
      setUserInfo(userResponse);

      // Calendar Info
      /// get date and time (maybe something like this can go into utils)
      const current = new Date();
      const cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
      const tomorrowDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + (current.getDate() + 1);
      // currently the calendar info does not adjust to time zone. Need to fix such that only meetings for that Pacific Time Zone day show up
      const calendarResponse = await client
        .api('/me/calendarview?startdatetime=' + cDate + '&enddatetime=' + tomorrowDate)
        .header('Prefer', 'outlook.timezone="Pacific Standard Time"')
        .get();
      const calendar = calendarResponse as Calendar;
      setCalendar(calendar);
    })();
  }, [accessToken, setUserInfo, setCalendar]);
  return (
    <>
      {!userInfo ? <p>loading user info...</p> : <MainPage userInfo={userInfo} />}
      {!calendar ? (
        <Text as="p"> loading meeting info..</Text>
      ) : (
        <div className="data">
          <Text as="p"> Your Meetings Today</Text>
          <MeetingList messages={calendar['value']} />
          <Text as="p"> People to Meet Today</Text>
          <PeopleAvatarList messages={calendar['value']} />
        </div>
      )}
    </>
  );
};
