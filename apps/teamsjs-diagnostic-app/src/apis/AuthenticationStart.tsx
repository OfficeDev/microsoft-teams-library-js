import { app } from '@microsoft/teams-js';

function toQueryString(queryParams: any) {
  return Object.keys(queryParams)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
    .join('&');
}

function _guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function authenticateUser(): Promise<boolean> {
  try {
    const context = await app.getContext();
    if (!context?.user?.tenant?.id) {
      console.error('Context or Tenant ID is undefined');
      return false;
    }

    const state = _guid();
    localStorage.setItem("simple.state", state);
    localStorage.removeItem("simple.error");

    const queryParams = {
      client_id: 'dfc09063-e7e3-4023-9e01-7b93f819c0be',
      response_type: 'id_token token',
      response_mode: 'fragment',
      scope: 'https://graph.microsoft.com/User.Read openid',
      redirect_uri: window.location.origin + '/auth-end',  // Change to your auth end URL
      nonce: _guid(),
      state: state,
      login_hint: context.user.loginHint,
    };

    const authorizeEndpoint = `https://login.microsoftonline.com/${context.user.tenant.id}/oauth2/v2.0/authorize?${toQueryString(queryParams)}`;
    window.location.assign(authorizeEndpoint);
    return true;
  } catch (error) {
    console.error('Failed to construct authentication URL:', error);
    return false;
  }
}
