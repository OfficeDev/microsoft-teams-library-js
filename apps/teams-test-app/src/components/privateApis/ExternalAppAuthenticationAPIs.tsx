import { externalAppAuthentication } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils/ApiWithoutInput';
import { ApiWithTextInput } from '../utils/ApiWithTextInput';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppAuthenticationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppAuthenticationCapability',
    title: 'Check External App Authentication Capability',
    onClick: async () =>
      `External App Authentication module ${externalAppAuthentication.isSupported() ? 'is' : 'is not'} supported`,
  });

const AuthenticateAndResendRequest = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    authenticateParameters: {
      url: string;
      width?: number;
      height?: number;
      isExternal?: boolean;
    };
    originalRequestInfo: externalAppAuthentication.IOriginalRequestInfo;
  }>({
    name: 'authenticateAndResendRequest',
    title: 'Authenticate And Resend Request',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.authenticateParameters) {
          throw new Error('authenticateParameters is required');
        }
        if (!input.originalRequestInfo) {
          throw new Error('originalRequestInfo is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppAuthentication.authenticateAndResendRequest(
          input.appId,
          { ...input.authenticateParameters, url: new URL(input.authenticateParameters.url) },
          input.originalRequestInfo,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      authenticateParameters: {
        url: 'https://localhost:4000',
        width: 100,
        height: 100,
        isExternal: true,
      },
      originalRequestInfo: {
        requestType: externalAppAuthentication.OriginalRequestType.ActionExecuteInvokeRequest,
        type: 'Action.Execute',
        id: 'id1',
        verb: 'verb1',
        data: 'data1',
      },
    }),
  });

const AuthenticateWithOauth2 = (): React.ReactElement =>
  ApiWithTextInput<{
    titleId: string;
    oauthConfigId: string;
    oauthWindowParameters: {
      width?: number;
      height?: number;
      isExternal?: boolean;
    };
  }>({
    name: 'authenticateWithOauth2',
    title: 'Authenticate With Oauth2',
    onClick: {
      validateInput: (input) => {
        if (!input.titleId) {
          throw new Error('titleId is required');
        }
        if (!input.oauthConfigId) {
          throw new Error('oauthConfigId is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppAuthentication.authenticateWithOauth2(
          input.titleId,
          input.oauthConfigId,
          input.oauthWindowParameters,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      titleId: 'U_c05d3a9a-c029-02d5-c6fa-5a7583fd3abe',
      oauthConfigId: 'testOauthConfigId',
      oauthWindowParameters: {
        width: 400,
        height: 400,
        isExternal: false,
      },
    }),
  });

const AuthenticateWithPPC = (): React.ReactElement =>
  ApiWithTextInput<{
    titleId: string;
    signInUrl?: URL;
    oauthWindowParameters: {
      width?: number;
      height?: number;
      isExternal?: boolean;
    };
  }>({
    name: 'authenticateWithPowerPlatformConnectorPlugins',
    title: 'Authenticate With Power Platform Connector Plugins',
    onClick: {
      validateInput: (input) => {
        if (!input.titleId) {
          throw new Error('titleId is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppAuthentication.authenticateWithPowerPlatformConnectorPlugins(
          input.titleId,
          input.signInUrl ? new URL(input.signInUrl) : undefined,
          input.oauthWindowParameters,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      titleId: 'U_c05d3a9a-c029-02d5-c6fa-5a7583fd3abe',
      signInUrl: 'https://localhost:4000',
      oauthWindowParameters: {
        width: 400,
        height: 400,
        isExternal: false,
      },
    }),
  });

const AuthenticateWithSSO = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters;
  }>({
    name: 'authenticateWithSSO',
    title: 'Authenticate With SSO',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.authTokenRequest) {
          throw new Error('authTokenRequest is required');
        }
      },
      submit: async (input) => {
        await externalAppAuthentication.authenticateWithSSO(input.appId, input.authTokenRequest);
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      authTokenRequest: {
        claims: ['https://graph.microsoft.com'],
        silent: true,
      },
    }),
  });

const AuthenticateWithSSOAndResendRequest = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters;
    originalRequestInfo: externalAppAuthentication.IOriginalRequestInfo;
  }>({
    name: 'authenticateWithSSOAndResendRequest',
    title: 'Authenticate With SSO And Resend Request',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.authTokenRequest) {
          throw new Error('authTokenRequest is required');
        }
        if (!input.originalRequestInfo) {
          throw new Error('originalRequestInfo is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppAuthentication.authenticateWithSSOAndResendRequest(
          input.appId,
          input.authTokenRequest,
          input.originalRequestInfo,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      authTokenRequest: {
        claims: ['https://graph.microsoft.com'],
        silent: true,
      },
      originalRequestInfo: {
        requestType: externalAppAuthentication.OriginalRequestType.ActionExecuteInvokeRequest,
        type: 'Action.Execute',
        id: 'id1',
        verb: 'verb1',
        data: 'data1',
      },
    }),
  });

const ExternalAppAuthenticationAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Authentication">
    <CheckExternalAppAuthenticationCapability />
    <AuthenticateAndResendRequest />
    <AuthenticateWithOauth2 />
    <AuthenticateWithPPC />
    <AuthenticateWithSSO />
    <AuthenticateWithSSOAndResendRequest />
  </ModuleWrapper>
);

export default ExternalAppAuthenticationAPIs;
