import { AppId, externalAppAuthentication, externalAppAuthenticationForCEA } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils/ApiWithoutInput';
import { ApiWithTextInput } from '../utils/ApiWithTextInput';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppAuthenticationForCEACapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppAuthenticationForCEACapability',
    title: 'Check External App Authentication CEA Capability',
    onClick: async () =>
      `External App Authentication For CEA module ${externalAppAuthenticationForCEA.isSupported() ? 'is' : 'is not'} supported`,
  });

const AuthenticateWithOAuthForCEA = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    conversationId: string;
    authenticateParameters: {
      url: string;
      width?: number;
      height?: number;
      isExternal?: boolean;
    };
  }>({
    name: 'AuthenticateWithOAuthForCEA',
    title: 'Authenticate With OAuth',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.conversationId) {
          throw new Error('conversationId is required');
        }
        if (!input.authenticateParameters) {
          throw new Error('authenticateParameters is required');
        }
      },
      submit: async (input) => {
        await externalAppAuthenticationForCEA.authenticateWithOauth(new AppId(input.appId), input.conversationId, {
          ...input.authenticateParameters,
          url: new URL(input.authenticateParameters.url),
        });
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      conversationId: 'testConversationId',
      authenticateParameters: {
        url: 'https://localhost:4000',
        width: 100,
        height: 100,
        isExternal: true,
      },
    }),
  });

const AuthenticateWithSSOForCEA = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    conversationId: string;
    authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters;
  }>({
    name: 'authenticateWithSSOForCEA',
    title: 'Authenticate With SSO',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.conversationId) {
          throw new Error('conversationId is required');
        }
        if (!input.authTokenRequest) {
          throw new Error('authTokenRequest is required');
        }
      },
      submit: async (input) => {
        await externalAppAuthenticationForCEA.authenticateWithSSO(
          new AppId(input.appId),
          input.conversationId,
          input.authTokenRequest,
        );

        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      conversationId: 'testConversationId',
      authTokenRequest: {
        claims: ['https://graph.microsoft.com'],
        silent: true,
      },
    }),
  });

const AuthenticateAndResendRequestForCEA = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    conversationId: string;
    authenticateParameters: {
      url: string;
      width?: number;
      height?: number;
      isExternal?: boolean;
    };
    originalRequestInfo: externalAppAuthentication.IActionExecuteInvokeRequest;
  }>({
    name: 'authenticateAndResendRequestForCEA',
    title: 'Authenticate And Resend Request',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.conversationId) {
          throw new Error('conversationId is required');
        }
        if (!input.authenticateParameters) {
          throw new Error('authenticateParameters is required');
        }
        if (!input.originalRequestInfo) {
          throw new Error('originalRequestInfo is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppAuthenticationForCEA.authenticateAndResendRequest(
          new AppId(input.appId),
          input.conversationId,
          { ...input.authenticateParameters, url: new URL(input.authenticateParameters.url) },
          input.originalRequestInfo,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      conversationId: 'testConversationId',
      authenticateParameters: {
        url: 'https://localhost:4000',
        width: 100,
        height: 100,
        isExternal: true,
      },
      originalRequestInfo: {
        requestType: 'ActionExecuteInvokeRequest',
        type: 'Action.Execute',
        id: 'id1',
        verb: 'verb1',
        data: 'data1',
      },
    }),
  });
const AuthenticateWithSSOAndResendRequestForCEA = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    conversationId: string;
    authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters;
    originalRequestInfo: externalAppAuthentication.IActionExecuteInvokeRequest;
  }>({
    name: 'authenticateWithSSOAndResendRequestForCEA',
    title: 'Authenticate With SSO And Resend Request',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.conversationId) {
          throw new Error('conversationId is required');
        }
        if (!input.authTokenRequest) {
          throw new Error('authTokenRequest is required');
        }
        if (!input.originalRequestInfo) {
          throw new Error('originalRequestInfo is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppAuthenticationForCEA.authenticateWithSSOAndResendRequest(
          new AppId(input.appId),
          input.conversationId,
          input.authTokenRequest,
          input.originalRequestInfo,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      conversationId: 'testConversationId',
      authTokenRequest: {
        claims: ['https://graph.microsoft.com'],
        silent: true,
      },
      originalRequestInfo: {
        requestType: 'ActionExecuteInvokeRequest',
        type: 'Action.Execute',
        id: 'id1',
        verb: 'verb1',
        data: 'data1',
      },
    }),
  });

const ExternalAppAuthenticationForCEAAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Authentication for CEA">
    <CheckExternalAppAuthenticationForCEACapability />
    <AuthenticateWithOAuthForCEA />
    <AuthenticateWithSSOForCEA />
    <AuthenticateAndResendRequestForCEA />
    <AuthenticateWithSSOAndResendRequestForCEA />
  </ModuleWrapper>
);

export default ExternalAppAuthenticationForCEAAPIs;
