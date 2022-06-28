/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { graphConfig } from './components/authConfig';

/**
 * Attaches a given access token to a Microsoft Graph API call. Returns information about the user
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function callMsGraphUser(accessToken) {
  // eslint-disable-next-line no-undef
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append('Authorization', bearer);

  const options = {
    method: 'GET',
    headers: headers,
  };

  // eslint-disable-next-line no-undef
  return fetch(graphConfig.graphMeEndpoint, options)
    .then(response => response.json())
    .catch(error => console.log(error));
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function callMsGraphEmail(accessToken) {
  // eslint-disable-next-line no-undef
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append('Authorization', bearer);

  const options = {
    method: 'GET',
    headers: headers,
  };

  // eslint-disable-next-line no-undef
  return fetch(graphConfig.graphEmailEndpoint, options)
    .then(response => response.json())
    .catch(error => console.log(error));
}
