import { nestedAppAuth } from '@microsoft/teams-js';
import React, { ReactElement, useState } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NestedAppAuthRequest = JSON.stringify({
  messageType: 'NestedAppAuthRequest',
  method: 'GetToken',
  sendTime: 1732269811006,
  clientLibrary: 'testOS',
  clientLibraryVersion: '1.0.0',
  requestId: '684352c2-7ab7-4def-b7e1-XXXXXXXXXXX',
  tokenParams: {
    correlationId: '39dc85fe-9054-11ed-a1eb-XXXXXXXXXXX',
  },
});

type NestedAppAuthBridge = {
  postMessage: (message: string) => void;
  addEventListener: (type: string, listener: (response: unknown) => void) => void;
  removeEventListener: (type: string, listener: (response: unknown) => void) => void;
};

const NestedAppAuthAPIs = (): ReactElement => {
  const CheckIsNAAChannelRecommended = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkIsNAAChannelRecommended',
      title: 'Check NAA Channel Recommended',
      onClick: async () => `NAA channel ${nestedAppAuth.isNAAChannelRecommended() ? 'is' : 'is not'} recommended`,
    });

  const SendMessageToNestedAppAuthBridge = (): React.ReactElement =>
    ApiWithTextInput({
      name: 'SendMessageToNestedAppAuthBridge',
      title: 'Send NAA Message to NestedAppAuth Bridge',
      onClick: {
        validateInput: () => {},
        submit: async (input, setResult) => {
          const bridge = (window as Window & { nestedAppAuthBridge?: NestedAppAuthBridge }).nestedAppAuthBridge;
          if (!bridge) {
            setResult('Bridge not available');
            return 'Bridge not available';
          }

          // Define listener for responses
          const listener = (response: unknown): void => {
            setResult(JSON.stringify(response, null, 2));
            bridge.removeEventListener?.('message', listener);
          };

          // Add event listener
          bridge.addEventListener?.('message', listener);
          bridge.postMessage?.(JSON.stringify(input));

          setResult('Message sent successfully, awaiting response...');
          return 'Message sent successfully';
        },
      },
      defaultInput: NestedAppAuthRequest,
    });

  const SendMessageToTopWindow = (): React.ReactElement =>
    ApiWithTextInput({
      name: 'SendMessageToTopWindow',
      title: 'Send NAA Message to Top Window',
      onClick: {
        validateInput: () => {},
        submit: async (input, setResult) => {
          try {
            const targetOrigin = 'https://local.teams.office.com:8080';

            // Check if window.top is accessible
            if (!window.top) {
              setResult('Top window not accessible');
              return 'Top window not accessible';
            }

            // Define listener for responses
            const listener = (event: MessageEvent): void => {
              // Ensure the message comes from the expected origin
              if (event.origin !== targetOrigin) {
                console.warn('Received message from an unexpected origin:', event.origin);
                return;
              }

              console.log('Received response from top window:', event.data);
              setResult(JSON.stringify(event.data, null, 2)); // Pretty-print response
              window.removeEventListener('message', listener);
            };

            // Add event listener for messages
            window.addEventListener('message', listener);
            window.top.postMessage(input, targetOrigin);

            setResult('Message sent to top window, awaiting response...');
            return 'Message sent to top window';
          } catch (error) {
            console.error('Error sending message to top window:', error);
            setResult(`Error: ${error}`);
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        id: '2',
        func: 'nestedAppAuth.execute',
        args: [],
        data: NestedAppAuthRequest,
      }),
    });

  const AddChildIframeSection = (): React.ReactElement | null => {
    const [iframeAdded, setIframeAdded] = useState(false);

    const addChildIframe = (): void => {
      if (iframeAdded) {
        console.log('Iframe already added.');
        return;
      }

      const iframeContainer = document.getElementById('NestedChildiframeContainer');
      if (!iframeContainer) {
        console.error('Container not found: NestedChildiframeContainer');
        return;
      }

      const childIframe = document.createElement('iframe');
      childIframe.src = `${window.location.href}?appInitializationTest=true&groupedMode=NestedAppAuthAPIs`;
      childIframe.id = 'nestedAuthChildIframe';
      childIframe.width = '100%';
      childIframe.height = '400px';
      childIframe.style.border = 'none';

      iframeContainer.appendChild(childIframe);
      setIframeAdded(true);
    };

    return (
      <div style={{ border: '5px solid black', padding: '2px', margin: '2px' }}>
        <h2>Add Nested Child Iframe</h2>
        <input
          name="button_addNestedChildIframe"
          type="button"
          value="Add Child Iframe"
          onClick={addChildIframe}
          disabled={iframeAdded}
        />
        <div
          id="NestedChildiframeContainer"
          style={{
            marginTop: '2px',
            height: '400px',
            border: '2px solid red',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        ></div>
      </div>
    );
  };

  return (
    <ModuleWrapper title="NestedAppAuth">
      <CheckIsNAAChannelRecommended />
      <SendMessageToNestedAppAuthBridge />
      <SendMessageToTopWindow />
      <AddChildIframeSection />
    </ModuleWrapper>
  );
};

export default NestedAppAuthAPIs;
