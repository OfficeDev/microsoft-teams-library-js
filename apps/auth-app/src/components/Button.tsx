/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useMsal } from '@azure/msal-react';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import React from 'react';

import { loginRequest } from './authConfig';

function handleLogin(instance) {
  instance.loginRedirect(loginRequest).catch(e => {
    console.error(e);
  });
}

/**
 * Renders a button which, when selected, will redirect the page to the login prompt
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const SignInButton = () => {
  const { instance } = useMsal();

  return <PrimaryButton text="Sign in using Redirect" className="ml-auto" onClick={() => handleLogin(instance)} />;
};
