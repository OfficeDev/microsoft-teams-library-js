import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';

const RegisterAppButtonClickHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerAppButtonClickHandler',
    title: 'Register App Button Click Handler',
    onClick: async setResult => {
      pages.appButton.onClick((): void => {
        setResult('successfully called');
      });
      return 'registered';
    },
  });

const RegisterAppButtonHoverEnterHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerAppButtonHoverEnterHandler',
    title: 'Register App Button Hover Enter Handler',
    onClick: async setResult => {
      pages.appButton.onHoverEnter((): void => {
        setResult('successfully called');
      });
      return 'registered';
    },
  });

const RegisterAppButtonHoverLeaveHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerAppButtonHoverLeaveHandler',
    title: 'Register App Button Hover Leave Handler',
    onClick: async setResult => {
      pages.appButton.onHoverLeave((): void => {
        setResult('successfully called');
      });
      return 'registered';
    },
  });

const PagesAppButtonAPIs = (): ReactElement => (
  <>
    <h1>pages.appButton</h1>
    <RegisterAppButtonClickHandler />
    <RegisterAppButtonHoverEnterHandler />
    <RegisterAppButtonHoverLeaveHandler />
  </>
);

export default PagesAppButtonAPIs;
