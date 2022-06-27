import { useMsal } from '@azure/msal-react';

import { loginRequest } from './authConfig';

function handleLogin(instance): void {
  instance.loginRedirect(loginRequest).catch(e => {
    console.error(e);
  });
}
{
  /*}
function SignInButton(): () => void {
  const { instance } = useMsal();
  handleLogin(instance);
  return () => handleLogin(instance);
}
*/
}
export const SignInButton = (): (() => void) => {
  const { instance } = useMsal();
  handleLogin(instance);
  return () => handleLogin(instance);
};
