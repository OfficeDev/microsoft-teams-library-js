import {
  pages,
  registerAppButtonClickHandler,
  registerAppButtonHoverEnterHandler,
  registerAppButtonHoverLeaveHandler,
} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const RegisterAppButtonClickHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerAppButtonClickHandler',
    title: 'Register App Button Click Handler',
    onClick: {
      withPromise: async (setResult) => {
        pages.appButton.onClick((): void => {
          setResult('successfully called');
        });
        return 'registered';
      },
      withCallback: (setResult) => {
        registerAppButtonClickHandler((): void => {
          setResult('successfully called');
        });
        setResult('registered');
      },
    },
  });

const RegisterAppButtonHoverEnterHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerAppButtonHoverEnterHandler',
    title: 'Register App Button Hover Enter Handler',
    onClick: {
      withPromise: async (setResult) => {
        pages.appButton.onHoverEnter((): void => {
          setResult('successfully called');
        });
        return 'registered';
      },
      withCallback: (setResult) => {
        registerAppButtonHoverEnterHandler((): void => {
          setResult('successfully called');
        });
        setResult('registered');
      },
    },
  });

const RegisterAppButtonHoverLeaveHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerAppButtonHoverLeaveHandler',
    title: 'Register App Button Hover Leave Handler',
    onClick: {
      withPromise: async (setResult) => {
        pages.appButton.onHoverLeave((): void => {
          setResult('successfully called');
        });
        return 'registered';
      },
      withCallback: (setResult) => {
        registerAppButtonHoverLeaveHandler((): void => {
          setResult('successfully called');
        });
        setResult('registered');
      },
    },
  });

const PagesAppButtonAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages.appButton">
    <RegisterAppButtonClickHandler />
    <RegisterAppButtonHoverEnterHandler />
    <RegisterAppButtonHoverLeaveHandler />
  </ModuleWrapper>
);

export default PagesAppButtonAPIs;
