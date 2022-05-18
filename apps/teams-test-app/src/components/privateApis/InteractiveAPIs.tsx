import { interactive } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const GetFluidTenantInfo = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getFluidTenantInfo',
    title: 'Get Fluid Tenant Info',
    onClick: async () => {
      const result = await interactive.getFluidTenantInfo();
      return JSON.stringify(result);
    },
  });

const GetFluidToken = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getFluidToken',
    title: 'Get Fluid Token',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async input => {
        const result = await interactive.getFluidToken(input);
        return JSON.stringify(result);
      },
    },
  });

const GetFluidContainerId = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getFluidContainerId',
    title: 'Get Fluid Container Id',
    onClick: async () => {
      const result = await interactive.getFluidContainerId();
      return JSON.stringify(result);
    },
  });

const SetFluidContainerId = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'setFluidContainerId',
    title: 'Set Fluid Container Id',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async input => {
        const result = await interactive.setFluidContainerId(input);
        return JSON.stringify(result);
      },
    },
  });

const GetNtpTime = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getNtpTime',
    title: 'Get Ntp Time',
    onClick: async () => {
      const result = await interactive.getNtpTime();
      return JSON.stringify(result);
    },
  });

const RegisterClientId = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'registerClientId',
    title: 'Register Client Id',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async input => {
        const result = await interactive.registerClientId(input);
        return JSON.stringify(result);
      },
    },
  });

const GetClientRoles = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getClientRoles',
    title: 'Get Client Roles',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async input => {
        const result = await interactive.getClientRoles(input);
        return JSON.stringify(result);
      },
    },
  });

const InteractiveAPIs = (): React.ReactElement => (
  <>
    <h1>interactive</h1>
    <GetFluidTenantInfo />
    <GetFluidToken />
    <GetFluidContainerId />
    <SetFluidContainerId />
    <GetNtpTime />
    <RegisterClientId />
    <GetClientRoles />
  </>
);

export default InteractiveAPIs;
