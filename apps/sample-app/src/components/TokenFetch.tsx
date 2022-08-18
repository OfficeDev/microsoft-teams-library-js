import { useMsal } from '@azure/msal-react';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { authentication } from '@microsoft/teams-js';
import React from 'react';

import { loginRequest } from './authConfig';

const TokenFetchComponent: React.FC = () => {
  const { instance, accounts } = useMsal();

  const [accessToken, setAccessToken] = React.useState<string>();

  React.useEffect(() => {
    const request = {
      ...loginRequest,
      account: accounts[0],
    };
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        setAccessToken(response.accessToken);
        authentication.notifySuccess(response.accessToken);
      })
      .catch((response) => {
        authentication.notifyFailure(response);
      });
  }, [setAccessToken, accounts, instance]);

  return (
    <>
      {!accessToken ? (
        <>
          <p>Fetching access token...</p>
          <Spinner size={SpinnerSize.large} />
        </>
      ) : (
        <p>...</p>
      )}
    </>
  );
};

export default TokenFetchComponent;
