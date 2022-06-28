/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useIsAuthenticated } from '@azure/msal-react';
import React from 'react';

import { SignInButton } from './components/Button';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const PageLayout = props => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      {isAuthenticated ? <span>Signed In</span> : <SignInButton />}
      <br />
      <br />
      {props.children}
    </>
  );
};
