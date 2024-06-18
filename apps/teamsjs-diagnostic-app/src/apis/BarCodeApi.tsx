import React from 'react';
//import { barCode } from '@microsoft/teams-js';
//import { captureConsoleLogs } from './../components/sample/LoggerUtility';

const BarCodeAPIs: React.FC = () => {
  /*
  const checkBarCodeCapability = async () => {
    captureConsoleLogs((log) => console.log(log));
    console.log('Checking if BarCode module is supported...');
    const isSupported = barCode.isSupported();
    console.log(`BarCode module ${isSupported ? 'is' : 'is not'} supported`);
    return `BarCode module ${isSupported ? 'is' : 'is not'} supported`;
  };

  const hasBarCodePermission = async () => {
    captureConsoleLogs((log) => console.log(log));
    console.log('Checking BarCode permission...');
    const result = await barCode.hasPermission();
    console.log('BarCode permission result:', result);
    return JSON.stringify(result);
  };

  const requestBarCodePermission = async () => {
    captureConsoleLogs((log) => console.log(log));
    console.log('Requesting BarCode permission...');
    const result = await barCode.requestPermission();
    console.log('BarCode permission request result:', result);
    return JSON.stringify(result);
  };*/

  return (
    <div className="api-header">API: BarCode</div>
  );
};

export default BarCodeAPIs;