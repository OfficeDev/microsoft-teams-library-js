import { Text } from '@fluentui/react-components';
import { AuthProvider, AuthProviderCallback, Client, Options } from '@microsoft/microsoft-graph-client';
import { Calendar, User } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { MainPage } from './MainPage';
import { MeetingList } from './Meetings';
import { PeopleAvatarList } from './PeopleAvatars';
import { getDates } from './utils';

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
      const options: Options = { authProvider };
      const client = Client.init(options);
      // get User Profile Info
      const userResponse = await client.api('/me').get();
      setUserInfo(userResponse);

      // get Calendar Meeting Info
      const [currDate, tomorrowDate] = getDates();
      // currently the calendar info does not adjust to time zone. Need to fix such that only meetings for that Pacific Time Zone day show up
      const calendarResponse = await client
        .api('/me/calendarview?startdatetime=' + currDate + '&enddatetime=' + tomorrowDate)
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
        <div className="flex-container">
          <div className="column">
            <Text weight="semibold" className="paddingClass" as="p">
              Your Meetings Today
            </Text>
            <MeetingList messages={calendar['value']} />
          </div>
          <div className="column">
            <Text weight="semibold" className="paddingClass" as="p">
              People to Meet Today
            </Text>
            {!userInfo ? <p> getting info </p> : <PeopleAvatarList messages={calendar['value']} user={userInfo} />}
          </div>
        </div>
      )}
    </>
  );
};
