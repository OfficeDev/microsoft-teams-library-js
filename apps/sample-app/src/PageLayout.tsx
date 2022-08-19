import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import React from 'react';

import { loginRequest } from './components/authConfig';

function handleLogin(instance): void {
  instance.loginRedirect(loginRequest).catch((e) => {
    console.error(e);
  });
}
interface props {
  children: unknown;
}
export const PageLayout: React.FC<props> = ({ children }: props) => {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  return (
    <>
      {!isAuthenticated && handleLogin(instance)}
      {children}
    </>
  );
};
