import { AuthTokenRequestParameters, externalAppAuthenticationForCEC } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils/ApiWithoutInput';
import { ApiWithTextInput } from '../utils/ApiWithTextInput';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppAuthenticationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppAuthenticationCapability',
    title: 'Check External App Authentication Capability',
    onClick: async () =>
      `External App Authentication module ${externalAppAuthenticationForCEC.isSupported() ? 'is' : 'is not'} supported`,
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
        const oAuthcallback = () => {
          console.log('callback received');
        };
        const result = await externalAppAuthenticationForCEC.authenticateWithOAuth(
          input.appId,
          input.conversationId,
          { ...input.authenticateParameters, url: new URL(input.authenticateParameters.url) },
          oAuthcallback,
        );
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      conversationId: 'testConversationId',
      authenticateParameters: {
        url: 'https://www.example.com',
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
      submit: async (input, setResult) => {
        const ssoCallback = () => {
          console.log('callback received');
          setResult('callback received');
        };
        await externalAppAuthenticationForCEC.authenticateWithSSO(
          input.appId,
          input.conversationId,
          input.authTokenRequest,
          ssoCallback,
        );
        console.log('completed');
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

const ExternalAppAuthenticationForCECAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Authentication for CEC">
    <CheckExternalAppAuthenticationCapability />
    <AuthenticateWithOAuth />
    <AuthenticateWithSSO />
  </ModuleWrapper>
);

export default ExternalAppAuthenticationForCECAPIs;
