import { call } from '@microsoft/teamsjs-app-sdk';
import React from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const CallAPIs: React.FC = () => {
  const [startCallRes, setStartCallRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const startCall = (callParams: string): void => {
    setStartCallRes('call.startCall()' + noHubSdkMsg);
    call
      .startCall(JSON.parse(callParams))
      .then(success => setStartCallRes('result: ' + success))
      .catch(reason => setStartCallRes(reason));
  };

  const checkCallCapability = (): void => {
    if (call.isSupported()) {
      setCapabilityCheckRes('Call module is supported');
    } else {
      setCapabilityCheckRes('Call module is not supported');
    }
  };
  return (
    <>
      <h1>call</h1>
      <BoxAndButton
        handleClickWithInput={startCall}
        output={startCallRes}
        hasInput={true}
        title="Start Call"
        name="startCall"
      />
      <BoxAndButton
        handleClick={checkCallCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Capability Call"
        name="checkCapabilityCall"
      />
    </>
  );
};

export default CallAPIs;
