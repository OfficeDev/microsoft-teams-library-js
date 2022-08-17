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
        return JSON.stringify(scannedCode);
      },
    },
  });

const HasBarCodePermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hasBarCodePermission',
    title: 'Has Permission',
    onClick: async () => {
      const result = await barCode.hasPermission();
      return JSON.stringify(result);
    },
  });

const RequestBarCodePermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestBarCodePermission',
    title: 'Request Permission',
    onClick: async () => {
      const result = await barCode.requestPermission();
      return JSON.stringify(result);
    },
  });

const WebAPIGetUserMedia = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'WebAPIGetUserMedia',
    title: 'Web API GetUserMedia',
    onClick: async setResult => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(stream => {
          setResult('Recording enabled');
          const track = stream.getTracks()[0];
          track.stop();
        });
      } else {
        const result = 'navigator.mediaDevices is not accessible';
        setResult(result);
      }
      return JSON.stringify('Do not have required permissions to access media');
    },
  });

const BarCodeAPIs = (): ReactElement => (
  <>
    <h1>barCode</h1>
    <ScanBarCode />
    <HasBarCodePermission />
    <RequestBarCodePermission />
    <CheckBarCodeCapability />
    <WebAPIGetUserMedia />
  </>
);

export default BarCodeAPIs;
