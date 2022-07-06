import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
// need to edit below import so as to not use fluent northstar
import { Props } from '@fluentui/react-northstar';
import React from 'react';

import { loginRequest } from './components/authConfig';

function handleLogin(instance): void {
  instance.loginRedirect(loginRequest).catch(e => {
    console.error(e);
  });
}
export const PageLayout: React.FC<Props> = ({ children }: Props) => {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  return (
    <>
      {isAuthenticated ? <div className="appMainPage">Signed In</div> : handleLogin(instance)}
      {children}
    </>
  );
};
