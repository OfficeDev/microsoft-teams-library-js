import { DisplayMode, IModalOptions, IToolInput, JSONValue, widgetHosting } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const WidgetHostingAPIs = (): ReactElement => {
  const CheckWidgetHostingCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkWidgetHostingCapability',
      title: 'Check if Widget Hosting is supported',
      onClick: async () => `Widget Hosting module ${widgetHosting.isSupported() ? 'is' : 'is not'} supported`,
    });
  interface CallToolInput {
    widgetId: string;
    toolInput: IToolInput;
  }

  const CallTool = (): ReactElement =>
    ApiWithTextInput<CallToolInput>({
      name: 'callTool',
      title: 'Call Tool',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          if (!input.toolInput?.name) {
            throw new Error('Tool name is required');
          }
        },
        submit: async (input) => {
          try {
            const result = await widgetHosting.callTool(input.widgetId, input.toolInput);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        toolInput: {
          name: 'exampleTool',
          arguments: {
            param1: 'value1',
            param2: 42,
          },
        },
      }),
    });

  interface SendFollowUpMessageInput {
    widgetId: string;
    prompt: string;
  }

  const SendFollowUpMessage = (): ReactElement =>
    ApiWithTextInput<SendFollowUpMessageInput>({
      name: 'sendFollowUpMessage',
      title: 'Send Follow-up Message',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          if (!input.prompt || input.prompt.trim() === '') {
            throw new Error('Prompt is required');
          }
        },
        submit: async (input) => {
          try {
            await widgetHosting.sendFollowUpMessage(input.widgetId, { prompt: input.prompt });
            return 'Follow-up message sent successfully';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        prompt: 'Can you provide more details about this topic?',
      }),
    });

  interface RequestDisplayModeInput {
    widgetId: string;
    mode: DisplayMode;
  }

  const RequestDisplayMode = (): ReactElement =>
    ApiWithTextInput<RequestDisplayModeInput>({
      name: 'requestDisplayMode',
      title: 'Request Display Mode',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          const validModes: DisplayMode[] = ['pip', 'inline', 'fullscreen'];
          if (!input.mode || !validModes.includes(input.mode)) {
            throw new Error('Valid mode is required (pip, inline, or fullscreen)');
          }
        },
        submit: async (input) => {
          try {
            await widgetHosting.requestDisplayMode(input.widgetId, { mode: input.mode });
            return 'Display mode requested successfully';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        mode: 'inline',
      }),
    });

  interface SetWidgetStateInput {
    widgetId: string;
    state: JSONValue;
  }

  const SetWidgetState = (): ReactElement =>
    ApiWithTextInput<SetWidgetStateInput>({
      name: 'setWidgetState',
      title: 'Set Widget State',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          if (!input.state || typeof input.state !== 'object') {
            throw new Error('Valid state object is required');
          }
        },
        submit: async (input) => {
          try {
            await widgetHosting.setWidgetState(input.widgetId, input.state);
            return 'Widget state set successfully';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        state: {
          currentStep: 1,
          userPreferences: {
            theme: 'dark',
            language: 'en',
          },
          data: {
            lastUpdated: new Date().toISOString(),
          },
        },
      }),
    });

  interface OpenExternalInput {
    widgetId: string;
    href: string;
  }

  const OpenExternal = (): ReactElement =>
    ApiWithTextInput<OpenExternalInput>({
      name: 'openExternal',
      title: 'Open External URL',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          if (!input.href || !input.href.startsWith('http')) {
            throw new Error('Valid HTTP URL is required');
          }
        },
        submit: async (input) => {
          try {
            widgetHosting.openExternal(input.widgetId, { href: input.href });
            return 'External URL opened successfully';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        href: 'https://www.microsoft.com',
      }),
    });

  interface RequestModalInput {
    widgetId: string;
    modalOptions: IModalOptions;
  }

  const RequestModal = (): ReactElement =>
    ApiWithTextInput<RequestModalInput>({
      name: 'requestModal',
      title: 'Request Modal',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          if (!input.modalOptions?.id || !input.modalOptions.content) {
            throw new Error('Modal id and content are required');
          }
        },
        submit: async (input) => {
          try {
            const result = await widgetHosting.requestModal(input.widgetId, input.modalOptions);
            return `Modal opened successfully. Modal element: ${JSON.stringify(result, null, 2)}`;
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        modalOptions: {
          id: 'modal-123',
          title: 'Example Modal',
          content: '<div><h2>Modal Content</h2><p>This is an example modal content.</p></div>',
          width: 600,
          height: 400,
        },
      }),
    });

  interface NotifyIntrinsicHeightInput {
    widgetId: string;
    height: number;
  }

  const NotifyIntrinsicHeight = (): ReactElement =>
    ApiWithTextInput<NotifyIntrinsicHeightInput>({
      name: 'notifyIntrinsicHeight',
      title: 'Notify Intrinsic Height',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          if (typeof input.height !== 'number' || input.height <= 0) {
            throw new Error('Height must be a positive number');
          }
        },
        submit: async (input) => {
          try {
            widgetHosting.notifyIntrinsicHeight(input.widgetId, input.height);
            return `Intrinsic height notified: ${input.height}px for widget: ${input.widgetId}`;
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        height: 500,
      }),
    });

  interface ContentSizeChangedInput {
    widgetId: string;
    width: number;
    height: number;
  }

  const ContentSizeChanged = (): ReactElement =>
    ApiWithTextInput<ContentSizeChangedInput>({
      name: 'contentSizeChanged',
      title: 'Notify Content Size Changed',
      onClick: {
        validateInput: (input) => {
          if (!input.widgetId) {
            throw new Error('Widget ID is required');
          }
          if (typeof input.width !== 'number' || typeof input.height !== 'number') {
            throw new Error('Width and height must be numbers');
          }
          if (input.width <= 0 || input.height <= 0) {
            throw new Error('Width and height must be positive numbers');
          }
        },
        submit: async (input) => {
          try {
            widgetHosting.contentSizeChanged(input.widgetId, input.width, input.height);
            return `Content size changed to ${input.width}x${input.height} for widget: ${input.widgetId}`;
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        widgetId: 'widget-123',
        width: 300,
        height: 200,
      }),
    });

  const RegisterModalCloseHandler = (): React.ReactElement =>
    ApiWithoutInput({
      name: 'registerModalCloseHandler',
      title: 'Register Modal Close Handler',
      onClick: async (setResult) => {
        const handler = (modalId: string): void => {
          const res = `Modal Close Handler called with modalId: ${modalId}`;
          setResult(res);
        };
        widgetHosting.registerModalCloseHandler(handler);
        return generateRegistrationMsg('then the modal is closed by the user or host');
      },
    });

  return (
    <>
      <ModuleWrapper title="Widget Hosting - Core">
        <CheckWidgetHostingCapability />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - Tool Operations">
        <CallTool />
        <SendFollowUpMessage />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - Display & State">
        <NotifyIntrinsicHeight />
        <ContentSizeChanged />
        <RequestDisplayMode />
        <RequestModal />
        <SetWidgetState />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - External Actions">
        <OpenExternal />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - Event Handlers">
        <RegisterModalCloseHandler />
      </ModuleWrapper>
    </>
  );
};

export default WidgetHostingAPIs;
