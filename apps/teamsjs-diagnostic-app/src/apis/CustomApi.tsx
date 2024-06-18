import React from 'react';
//import { sendCustomMessage } from '@microsoft/teams-js';

const CustomAPIs: React.FC = () => {
    /*
  const callCustomApiEvent = async () => {
    console.log('Calling Custom API (Event)...');
    await sendCustomMessage('custom-service-event');
    console.log('Custom API (Event) called');
  };

  const callCustomApiResponse = async () => {
    console.log('Calling Custom API (Response)...');
    await sendCustomMessage('custom-service-test', undefined, (args) => {
      console.log('Custom API (Response) received:', args);
    });
    console.log('Custom API (Response) called');
  };*/

  return (
      <div className="api-header">API: Custom</div>
  );
};

export default CustomAPIs;
