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
    ApiWithTextInput<widgetContext.UnknownObject>({
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

  interface ContentSizeInput {
    width: number;
    height: number;
  }

  const ContentSizeChanged = (): ReactElement =>
    ApiWithTextInput<ContentSizeInput>({
      name: 'contentSizeChanged',
      title: 'Notify Content Size Changed',
      onClick: {
        validateInput: (input) => {
          if (typeof input.width !== 'number' || typeof input.height !== 'number') {
            throw new Error('Width and height must be numbers');
          }
          if (input.width <= 0 || input.height <= 0) {
            throw new Error('Width and height must be positive numbers');
          }
        },
        submit: async (input) => {
          try {
            widgetHosting.contentSizeChanged(input.width, input.height);
            return `Content size changed to ${input.width}x${input.height}`;
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        width: 300,
        height: 200,
      }),
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
        <RequestDisplayMode />
        <SetWidgetState />
      </ModuleWrapper>

      <ModuleWrapper title="Widget Hosting - External Actions">
        <OpenExternal />
        <ContentSizeChanged />
      </ModuleWrapper>
    </>
  );
};

export default WidgetHostingAPIs;
