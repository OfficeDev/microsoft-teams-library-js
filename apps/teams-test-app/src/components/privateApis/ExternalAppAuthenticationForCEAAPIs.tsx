import {
  AuthTokenRequestParameters,
  externalAppAuthenticationForCEA,
  IActionExecuteInvokeRequest,
} from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils/ApiWithoutInput';
import { ApiWithTextInput } from '../utils/ApiWithTextInput';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppAuthenticationForCEACapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppAuthenticationCEACapability',
    title: 'Check External App Authentication CEA Capability',
    onClick: async () =>
      `External App Authentication CEA module ${externalAppAuthenticationForCEA.isSupported() ? 'is' : 'is not'} supported`,
  });

const AuthenticateWithOAuth = (): React.ReactElement =>
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
    name: 'AuthenticateWithOAuth',
    title: 'Authenticate With OAuth',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.authenticateParameters) {
          throw new Error('authenticateParameters is required');
        }
      },
      submit: async (input) => {
        await externalAppAuthenticationForCEA.authenticateWithOAuth(input.appId, input.conversationId, {
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

const AuthenticateWithSSO = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    conversationId: string;
    authTokenRequest: AuthTokenRequestParameters;
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
        await externalAppAuthenticationForCEA.authenticateWithSSO(
          input.appId,
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

const AuthenticateAndResendRequest = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    conversationId: string;
    authenticateParameters: {
      url: string;
      width?: number;
      height?: number;
      isExternal?: boolean;
    };
    originalRequestInfo: IActionExecuteInvokeRequest;
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
        const result = await externalAppAuthenticationForCEA.authenticateAndResendRequest(
          input.appId,
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
const AuthenticateWithSSOAndResendRequest = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    conversationId: string;
    authTokenRequest: AuthTokenRequestParameters;
    originalRequestInfo: IActionExecuteInvokeRequest;
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
        const result = await externalAppAuthenticationForCEA.authenticateWithSSOAndResendRequest(
          input.appId,
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
    <AuthenticateWithOAuth />
    <AuthenticateWithSSO />
    <AuthenticateAndResendRequest />
    <AuthenticateWithSSOAndResendRequest />
  </ModuleWrapper>
);

export default ExternalAppAuthenticationForCEAAPIs;
