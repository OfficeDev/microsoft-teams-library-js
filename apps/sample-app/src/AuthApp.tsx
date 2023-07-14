import './App.css';

import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { Spinner } from '@fluentui/react';
import { app } from '@microsoft/teams-js';
import React from 'react';

import TokenFetchComponent from './components/TokenFetch';
import { appInitializationFailed } from './components/utils';
import { PageLayout } from './PageLayout';

const AuthApp: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        await app.initialize();
        setIsInitialized(true);
      } catch (e) {
        alert('Initialization Error: App should be sideloaded onto a host');
        appInitializationFailed();
      }
    })();
  }, [setIsInitialized]);

  return (
    <>
      {isInitialized && (
        <PageLayout>
          <AuthenticatedTemplate>
            <TokenFetchComponent />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate></UnauthenticatedTemplate>
        </PageLayout>
      )}
      {!isInitialized && <Spinner />}
    </>
  );
};

export default AuthApp;
