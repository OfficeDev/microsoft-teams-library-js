/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useIsAuthenticated } from '@azure/msal-react';
import React from 'react';

import { SignInButton } from './components/Button';

/**
 * Renders the navbar component with a sign-in button if a user is not authenticated
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const PageLayout = props => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      {isAuthenticated ? <span>Signed In</span> : <SignInButton />}

      <h5>Hello World</h5>
      <br />
      <br />
      {props.children}
    </>
  );
};
