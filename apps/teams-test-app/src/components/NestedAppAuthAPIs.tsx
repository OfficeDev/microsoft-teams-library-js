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

const validateNAARequestInput = (input): void => {
  if (!input) {
    throw new Error('Input is required.');
  }

  if (input.messageType !== 'NestedAppAuthRequest') {
    throw new Error('Invalid or missing messageType. Expected "NestedAppAuthRequest".');
  }

  if (!input.method) {
    throw new Error('Method name is required in payload');
  }

  if (!input.requestId) {
    throw new Error('RequestId is required in payload');
  }
};

const validateTopWindowNAARequestInput = (input): void => {
  if (!input) {
    throw new Error('Input is required.');
  }

  if (!input.id) {
    throw new Error('"id" is required.');
  }

  if (!input.func) {
    throw new Error('"func" is required.');
  }

  if (!input.data) {
    throw new Error('"data" is required with NAA payload');
  }

  try {
    validateNAARequestInput(JSON.parse(input.data));
  } catch (error) {
    throw new Error('NAA payload must be a valid JSON');
  }
};

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

  const GetParentOrigin = (): ReactElement =>
    ApiWithoutInput({
      name: 'getParentOrigin',
      title: 'Get Parent Origin',
      onClick: async () => `${nestedAppAuth.getParentOrigin()}`,
    });

  const CanParentManageNAATrustedOrigins = (): ReactElement =>
    ApiWithoutInput({
      name: 'canParentManageNAATrustedOrigins',
      title: 'Can Parent Manage NAA TrustedOrigins list',
      onClick: async () => `${nestedAppAuth.canParentManageNAATrustedOrigins()}`,
    });

  const CheckIsDeeplyNestedAuthSupported = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkIsDeeplyNestedAuthSupported',
      title: 'Check Deeply Nested Auth Supported',
      onClick: async () =>
        `NAA deeply nested auth ${nestedAppAuth.isDeeplyNestedAuthSupported() ? 'is' : 'is not'} supported`,
    });

  const SendMessageToNestedAppAuthBridge = (): React.ReactElement =>
    ApiWithTextInput({
      name: 'sendMessageToNestedAppAuthBridge',
      title: 'Send NAA Message to NestedAppAuth Bridge',
      onClick: {
        validateInput: validateNAARequestInput,
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
      name: 'sendMessageToTopWindow',
      title: 'Send NAA Message to Top Window',
      onClick: {
        validateInput: validateTopWindowNAARequestInput,
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

  const AddChildIframeSection = (): React.ReactElement => {
    const [iframeAdded, setIframeAdded] = useState(false);

    const addChildIframe = (): void => {
      if (iframeAdded) {
        return;
      }

      const iframeContainer = document.getElementById('nestedChildIframeContainer');
      if (!iframeContainer) {
        console.error('Iframe container not found');
        return;
      }

      const childIframe = document.createElement('iframe');
      childIframe.src = '/naa_childIframe.html';
      childIframe.id = 'nestedAuthChildIframe';
      childIframe.style.width = '100%';
      childIframe.style.height = '400px';
      childIframe.style.border = 'none';

      iframeContainer.appendChild(childIframe);
      setIframeAdded(true);

      // Send payload to the iframe after it loads
      childIframe.onload = () => {
        const payloads = {
          defaultPayloadForBridge: NestedAppAuthRequest,
          defaultPayloadForTopWindow: JSON.stringify({
            id: '2',
            func: 'nestedAppAuth.execute',
            args: [],
            data: NestedAppAuthRequest,
          }),
        };
        childIframe.contentWindow?.postMessage(payloads, window.location.origin);
      };
    };

    return (
      <div
        className="boxAndButton"
        id="box_naaNestedChildIframe"
        style={{
          border: '5px solid black',
          padding: '5px',
          margin: '1px',
        }}
      >
        <h2>Child Iframe</h2>
        <input
          id="button_addNestedChildIframe"
          name="button_addNestedChildIframe"
          type="button"
          value="Add Child Iframe"
          onClick={addChildIframe}
          disabled={iframeAdded}
        />
        <div
          id="nestedChildIframeContainer"
          style={{
            marginTop: '20px',
            height: '450px',
            border: '1px solid red',
          }}
        />
      </div>
    );
  };
  const AddTrustedOrigin = (): React.ReactElement =>
    ApiWithTextInput<string[]>({
      name: 'NAAAddTrustedOrigin',
      title: 'Add Trusted Origin',
      onClick: {
        validateInput: (input) => {
          if (!Array.isArray(input) || input.length === 0) {
            throw new Error('At least one origin is required to delete.');
          }
        },
        submit: async (input) => {
          const result = await nestedAppAuth.addNAATrustedOrigins(input);
          return JSON.stringify(result);
        },
      },
      defaultInput: JSON.stringify(['https://contoso.com']),
    });

  const DeleteTrustedOrigin = (): React.ReactElement =>
    ApiWithTextInput<string[]>({
      name: 'NAADeleteTrustedOrigin',
      title: 'Delete Trusted Origin',
      onClick: {
        validateInput: (input) => {
          if (!Array.isArray(input) || input.length === 0) {
            throw new Error('At least one origin is required to delete.');
          }
        },
        submit: async (input) => {
          const result = await nestedAppAuth.deleteNAATrustedOrigins(input);
          return JSON.stringify(result);
        },
      },
      defaultInput: JSON.stringify(['https://contoso.com']),
    });

  return (
    <ModuleWrapper title="NestedAppAuth">
      <CheckIsNAAChannelRecommended />
      <CanParentManageNAATrustedOrigins />
      <GetParentOrigin />
      <CheckIsDeeplyNestedAuthSupported />
      <SendMessageToNestedAppAuthBridge />
      <SendMessageToTopWindow />
      <AddChildIframeSection />
      <AddTrustedOrigin />
      <DeleteTrustedOrigin />
    </ModuleWrapper>
  );
};

export default NestedAppAuthAPIs;
