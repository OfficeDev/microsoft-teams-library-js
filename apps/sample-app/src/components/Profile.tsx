import { AuthProvider, AuthProviderCallback, Client, Options } from '@microsoft/microsoft-graph-client';
import { Message } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { EmailList } from './EmailData';

interface ProfileContentProps {
  accessToken: string;
}

export const ProfileContent: React.FC<ProfileContentProps> = (props: ProfileContentProps) => {
  // save access token
  const { accessToken } = props;
  const [messages, setMessages] = React.useState<Message[]>();

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

  return (
    <>
      {!messages && <p>loading ...</p>}
      {messages && <EmailList messages={messages} />}
    </>
  );
};
