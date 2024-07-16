import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { OnBehalfOfCredentialAuthConfig, OnBehalfOfUserCredential, UserInfo } from '@microsoft/teamsfx';
import config from '../config';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Client } from '@microsoft/microsoft-graph-client';

export async function getUserProfile(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request.');

  // Initialize response.
  const res: HttpResponseInit = {
    status: 200,
  };
  const body = Object();

  // Put an echo into response body.
  body.receivedHTTPRequestBody = (await req.text()) || '';

  // Prepare access token.
  const accessToken: string = req.headers.get('Authorization')?.replace('Bearer ', '').trim();
  if (!accessToken) {
    return {
      status: 400,
      body: JSON.stringify({
        error: 'No access token was found in request header.',
      }),
    };
  }

  const oboAuthConfig: OnBehalfOfCredentialAuthConfig = {
    authorityHost: config.authorityHost,
    clientId: config.clientId,
    tenantId: config.tenantId,
    clientSecret: config.clientSecret,
  };

  let oboCredential: OnBehalfOfUserCredential;
  try {
    oboCredential = new OnBehalfOfUserCredential(accessToken, oboAuthConfig);
  } catch (e) {
    context.error(e);
    return {
      status: 500,
      body: JSON.stringify({
        error:
          'Failed to construct OnBehalfOfUserCredential using your accessToken. ' +
          'Ensure your function app is configured with the right Microsoft Entra App registration.',
      }),
    };
  }

  // Query user's information from the access token.
  try {
    const currentUser: UserInfo = await oboCredential.getUserInfo();
    if (currentUser && currentUser.displayName) {
      body.userInfoMessage = `User display name is ${currentUser.displayName}.`;
    } else {
      body.userInfoMessage = 'No user information was found in access token.';
    }
  } catch (e) {
    context.error(e);
    return {
      status: 400,
      body: JSON.stringify({
        error: 'Access token is invalid.',
      }),
    };
  }

  // Create a graph client with default scope to access user's Microsoft 365 data after user has consented.
  try {
    // Create an instance of the TokenCredentialAuthenticationProvider by passing the tokenCredential instance and options to the constructor
    const authProvider = new TokenCredentialAuthenticationProvider(oboCredential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    // Initialize Graph client instance with authProvider
    const graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    body.graphClientMessage = await graphClient.api('/me').get();
  } catch (e) {
    context.error(e);
    return {
      status: 500,
      body: JSON.stringify({
        error: 'Failed to retrieve user profile from Microsoft Graph. The application may not be authorized.',
      }),
    };
  }
  res.body = JSON.stringify(body);

  return res;
}

app.http('getUserProfile', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: getUserProfile,
});
