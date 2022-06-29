import { AuthProvider, AuthProviderCallback, Client, Options } from '@microsoft/microsoft-graph-client';
import { Message } from '@microsoft/microsoft-graph-types';
import { User } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { EmailList } from './EmailData';

interface ProfileContentProps {
  accessToken: string;
}

export const ProfileContent: React.FC<ProfileContentProps> = (props: ProfileContentProps) => {
  // save access token
  const { accessToken } = props;
  const [messages, setMessages] = React.useState<Message[]>();
  const [userInfo, setUserInfo] = React.useState<User[]>();

  //get response
  React.useEffect(() => {
    (async () => {
      const authProvider: AuthProvider = (callback: AuthProviderCallback) => {
        callback(undefined, accessToken);
      };
      const options: Options = { authProvider };
      const client = Client.init(options);
      const response = await client.api('/me/messages').get();
      const messages = response.value as Message[];
      setMessages(messages);
    })();
  }, [accessToken, setMessages]);

  React.useEffect(() => {
    (async () => {
      const authProvider: AuthProvider = (callback: AuthProviderCallback) => {
        callback(undefined, accessToken);
      };
      const options: Options = { authProvider };
      const client = Client.init(options);
      const response2 = await client.api('/me/').get();
      const userInfo = response2.value as User[];
      setUserInfo(userInfo);
    })();
  }, [accessToken, setUserInfo]);

  return (
    <>
      {!messages && <p>loading ...</p>}
      {messages && <EmailList messages={messages} />}
      {!userInfo && <p>loading user info...</p>}
      {userInfo && <p>User info loaded</p>}
    </>
  );
};
