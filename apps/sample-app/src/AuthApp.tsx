import './App.css';

import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { Spinner } from '@fluentui/react';
import { Text } from '@fluentui/react-components';
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
          <UnauthenticatedTemplate>
            <div className="appMainPage">
              <Text as="p">You are not signed in! Please sign in.</Text>
            </div>
          </UnauthenticatedTemplate>
        </PageLayout>
      )}
      {!isInitialized && <Spinner />}
    </>
  );
};

export default AuthApp;
