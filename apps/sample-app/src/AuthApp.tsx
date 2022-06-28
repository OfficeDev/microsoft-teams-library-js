import './App.css';

import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { Spinner } from '@fluentui/react';
import { app } from '@microsoft/teams-js';
import React from 'react';

import TokenFetchComponent from './components/TokenFetch';
import { PageLayout } from './PageLayout';

const AuthApp: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      await app.initialize();
      setIsInitialized(true);
    })();
  }, [setIsInitialized]);

  return (
    <>
      {isInitialized && (
        <PageLayout>
          <AuthenticatedTemplate>
            <TokenFetchComponent />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <p>You are not signed in! Please sign in.</p>
          </UnauthenticatedTemplate>
        </PageLayout>
      )}
      {!isInitialized && <Spinner />}
    </>
  );
};

export default AuthApp;
