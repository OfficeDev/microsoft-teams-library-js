import { SdkError, stageView } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckStageViewCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkStageViewCapability',
    title: 'Check StageView Capability',
    onClick: async () => `StageView ${stageView.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenStageView = (): ReactElement =>
  ApiWithTextInput<stageView.StageViewParams>({
    name: 'stageViewOpen',
    title: 'StageView Open',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId are required.');
        }
        if (!input.contentUrl) {
          throw new Error('contentUrl are required.');
        }
        if (!input.threadId) {
          throw new Error('threadId are required.');
        }
        if (!input.title) {
          throw new Error('title are required.');
        }
      },
      submit: {
        withPromise: async (input) => {
          await stageView.open(input);
          return 'opened';
        },
        withCallback: (input, setResult) => {
          const callback = (error?: SdkError): void => {
            if (error) {
              setResult(JSON.stringify(error));
            }
          };
          // remove after updating e2e tests
          stageView
            .open(input)
            .then()
            .catch((error) => callback(error));
        },
      },
    },
  });

const StageViewAPIs = (): ReactElement => (
  <ModuleWrapper title="StageView">
    <OpenStageView />
    <CheckStageViewCapability />
  </ModuleWrapper>
);

export default StageViewAPIs;
