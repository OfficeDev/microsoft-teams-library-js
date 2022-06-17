/* eslint-disable @typescript-eslint/explicit-function-return-type */
import './App.css';

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { PrimaryButton } from '@fluentui/react';
import React, { ReactElement, useState } from 'react';

import { loginRequest } from './components/authConfig';
import { PageLayout } from './PageLayout';

function ProfileContent() {
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState<string>('');

  const name = accounts[0] && accounts[0].name;

  function RequestAccessToken() {
    const request = {
      ...loginRequest,
      account: accounts[0],
    };

    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance
      .acquireTokenSilent(request)
      .then(response => {
        return setAccessToken(response.accessToken);
      })
      .catch(() => {
        instance.acquireTokenPopup(request).then(response => {
          setAccessToken(response.accessToken);
        });
      });
  }

  return (
    <>
      <h5 className="card-title">Welcome {name}</h5>
      {accessToken ? (
        <p>Access Token Acquired!</p>
      ) : (
        <PrimaryButton onClick={RequestAccessToken} text="Request Access Token" />
      )}
    </>
  );
}

const App0 = (): ReactElement => {
  return (
    <PageLayout>
      <AuthenticatedTemplate>
        <ProfileContent />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <p>You are not signed in! Please sign in.</p>
      </UnauthenticatedTemplate>
    </PageLayout>
  );
};

export default App0;
