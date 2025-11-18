import { widgetContext, widgetHosting } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const WidgetHostingAPIs = (): ReactElement => {
  const CheckWidgetHostingCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkWidgetHostingCapability',
      title: 'Check if Widget Hosting is supported',
      onClick: async () => `Widget Hosting module ${widgetHosting.isSupported() ? 'is' : 'is not'} supported`,
    });

  const GetWidgetData = (): ReactElement =>
    ApiWithoutInput({
      name: 'getWidgetData',
      title: 'Get Widget Data',
      onClick: async () => {
        try {
          const result = await widgetHosting.getWidgetData();
          return JSON.stringify(result, null, 2);
        } catch (error) {
          return `Error: ${error}`;
        }
      },
    });

  const CallTool = (): ReactElement =>
    ApiWithTextInput<widgetContext.IToolInput>({
      name: 'callTool',
      title: 'Call Tool',
      onClick: {
        validateInput: (input) => {
          if (!input.name) {
            throw new Error('Tool name is required');
          }
        },
        submit: async (input) => {
          try {
            const result = await widgetHosting.callTool(input);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        name: 'exampleTool',
        arguments: {
          param1: 'value1',
          param2: 42,
        },
      }),
    });

  const SendFollowUpMessage = (): ReactElement =>
    ApiWithTextInput<{ prompt: string }>({
      name: 'sendFollowUpMessage',
      title: 'Send Follow-up Message',
      onClick: {
        validateInput: (input) => {
          if (!input.prompt || input.prompt.trim() === '') {
            throw new Error('Prompt is required');
          }
        },
        submit: async (input) => {
          try {
            await widgetHosting.sendFollowUpMessage(input);
            return 'Follow-up message sent successfully';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        prompt: 'Can you provide more details about this topic?',
      }),
    });

  const RequestDisplayMode = (): ReactElement =>
    ApiWithTextInput<{ mode: widgetContext.DisplayMode }>({
      name: 'requestDisplayMode',
      title: 'Request Display Mode',
      onClick: {
        validateInput: (input) => {
          const validModes: widgetContext.DisplayMode[] = ['pip', 'inline', 'fullscreen'];
          if (!input.mode || !validModes.includes(input.mode)) {
            throw new Error('Valid mode is required (pip, inline, or fullscreen)');
          }
        },
        submit: async (input) => {
          try {
            const result = await widgetHosting.requestDisplayMode(input);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        mode: 'inline',
      }),
    });

  const SetWidgetState = (): ReactElement =>
    ApiWithTextInput<widgetContext.JSONValue>({
      name: 'setWidgetState',
      title: 'Set Widget State',
      onClick: {
        validateInput: (input) => {
          if (!input || typeof input !== 'object') {
            throw new Error('Valid state object is required');
          }
        },
        submit: async (input) => {
          try {
            await widgetHosting.setWidgetState(input);
            return 'Widget state set successfully';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        currentStep: 1,
        userPreferences: {
          theme: 'dark',
          language: 'en',
        },
        data: {
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

  const OpenExternal = (): ReactElement =>
    ApiWithTextInput<{ href: string }>({
      name: 'openExternal',
      title: 'Open External URL',
      onClick: {
        validateInput: (input) => {
          if (!input.href || !input.href.startsWith('http')) {
            throw new Error('Valid HTTP URL is required');
          }
        },
        submit: async (input) => {
          try {
            widgetHosting.openExternal(input);
            return 'External URL opened successfully';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        href: 'https://www.microsoft.com',
      }),
    });
  const RequestModal = (): ReactElement =>
    ApiWithTextInput<widgetContext.IModalOptions>({
      name: 'requestModal',
      title: 'Request Modal',
      onClick: {
        validateInput: (input) => {
          if (!input.id || !input.content) {
            throw new Error('Modal id and content are required');
          }
        },
        submit: async (input) => {
          try {
            const result = await widgetHosting.requestModal(input);
            return `Modal opened successfully. Modal element: ${JSON.stringify(result, null, 2)}`;
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        id: 'modal-123',
        title: 'Example Modal',
        content: '<div><h2>Modal Content</h2><p>This is an example modal content.</p></div>',
        width: 600,
        height: 400,
      }),
    });

  const NotifyIntrinsicHeight = (): ReactElement =>
    ApiWithTextInput<{ height: number }>({
      name: 'notifyIntrinsicHeight',
      title: 'Notify Intrinsic Height',
      onClick: {
        validateInput: (input) => {
          if (typeof input.height !== 'number' || input.height <= 0) {
            throw new Error('Height must be a positive number');
          }
        },
        submit: async (input) => {
          try {
            widgetHosting.notifyIntrinsicHeight(input.height);
            return `Intrinsic height notified: ${input.height}px`;
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        height: 500,
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
        return 'done';
      },
    });

  const RegisterWidgetUpdateHandler = (): React.ReactElement =>
    ApiWithoutInput({
      name: 'registerWidgetUpdateHandler',
      title: 'Register Widget Update Handler',
      onClick: async (setResult) => {
        const handler = (updateData: widgetContext.IWidgetContext): void => {
          const res = `Widget Update Handler called with data: ${JSON.stringify(updateData, null, 2)}`;
          setResult(res);
        };
        widgetHosting.registerWidgetUpdateHandler(handler);
        return 'done';
      },
    });
  return (
    <>
      <ModuleWrapper title="Widget Hosting - Core">
        <CheckWidgetHostingCapability />
        <GetWidgetData />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - Tool Operations">
        <CallTool />
        <SendFollowUpMessage />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - Display & State">
        <NotifyIntrinsicHeight />
        <RequestDisplayMode />
        <RequestModal />
        <SetWidgetState />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - External Actions">
        <OpenExternal />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - Event Handlers">
        <RegisterModalCloseHandler />
        <RegisterWidgetUpdateHandler />
      </ModuleWrapper>
    </>
  );
};

export default WidgetHostingAPIs;
