import { barCode } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

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
      validateInput: (input) => {
        if (!input) {
          throw new Error('BarCodeConfig is required');
        }
      },
      submit: async (input) => {
        const scannedCode = await barCode.scanBarCode(input);
        return JSON.stringify(scannedCode);
      },
    },
    defaultInput: '{}',
  });

const HasBarCodePermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hasBarCodePermission',
    title: 'Has BarCode Permission',
    onClick: async () => {
      const result = await barCode.hasPermission();
      return JSON.stringify(result);
    },
  });

const RequestBarCodePermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestBarCodePermission',
    title: 'Request BarCode Permission',
    onClick: async () => {
      const result = await barCode.requestPermission();
      return JSON.stringify(result);
    },
  });

const BarCodeAPIs = (): ReactElement => (
  <ModuleWrapper title="BarCode">
    <ScanBarCode />
    <HasBarCodePermission />
    <RequestBarCodePermission />
    <CheckBarCodeCapability />
  </ModuleWrapper>
);

export default BarCodeAPIs;
