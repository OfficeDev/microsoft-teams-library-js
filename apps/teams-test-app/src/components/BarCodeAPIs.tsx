import { barCode } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const CheckBarCodeCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkBarCodeCapability',
    title: 'Check BarCode Capability',
    onClick: async () => `BarCode ${barCode.isSupported() ? 'is' : 'is not'} supported`,
  });

const ScanBarCode = (): React.ReactElement =>
  ApiWithTextInput<barCode.BarCodeConfig>({
    name: 'scanBarCode',
    title: 'Scan Bar Code',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('BarCodeConfig is required');
        }
      },
      submit: async input => {
        const scannedCode = await barCode.scanBarCode(input);
        return scannedCode;
      },
    },
  });

const HasPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'HasPermission',
    title: 'Has Permission',
    onClick: async () => {
      const result = await barCode.hasPermission();
      return JSON.stringify(result);
    },
  });

const RequestPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'RequestPermission',
    title: 'Request Permission',
    onClick: async () => {
      const result = await barCode.requestPermission();
      return JSON.stringify(result);
    },
  });

const BarCodeAPIs = (): ReactElement => (
  <>
    <h1>barCode</h1>
    <ScanBarCode />
    <HasPermission />
    <RequestPermission />
    <CheckBarCodeCapability />
  </>
);

export default BarCodeAPIs;
