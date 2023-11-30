import { authentication, externalAppAuthentication } from '@microsoft/teams-js';
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
    authenticateParameters: authentication.AuthenticatePopUpParameters;
    originalRequestInfo: externalAppAuthentication.OriginalRequestInfo;
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
          input.authenticateParameters,
          input.originalRequestInfo,
        );
        return JSON.stringify(result);
      },
    },
  });

const AuthenticateWithSSO = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    authTokenRequest: authentication.AuthTokenRequestParameters;
  }>({
    name: 'authenticateWithSSO',
    title: 'Authenticate With SSO',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.authTokenRequest) {
          throw new Error('authenticateParameters is required');
        }
      },
      submit: async (input) => {
        await externalAppAuthentication.authenticateWithSSO(input.appId, input.authTokenRequest);
        return 'Called successfully';
      },
    },
  });

const AuthenticateWithSSOAndResendRequest = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    authTokenRequest: authentication.AuthTokenRequestParameters;
    originalRequestInfo: externalAppAuthentication.OriginalRequestInfo;
  }>({
    name: 'authenticateWithSSOAndResendRequest',
    title: 'Authenticate With SSO And Resend Request',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.authTokenRequest) {
          throw new Error('authenticateParameters is required');
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
  });

const ExternalAppAuthenticationAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Authentication">
    <CheckExternalAppAuthenticationCapability />
    <AuthenticateAndResendRequest />
    <AuthenticateWithSSO />
    <AuthenticateWithSSOAndResendRequest />
  </ModuleWrapper>
);

export default ExternalAppAuthenticationAPIs;
