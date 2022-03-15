import { SdkError, stageView } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';

const OpenStageView = (): ReactElement =>
  ApiWithTextInput<stageView.StageViewParams>({
    name: 'stageViewOpen',
    title: 'StageView Open',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: input => {
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
        withPromise: async input => {
          console.log('input!!!!!!!: ', input);
          await stageView.open(input);
          return 'opened';
        },
        withCallback: (input, setResult) => {
          console.log('input!!!!!!!: ', input);

          const callback = (error?: SdkError): void => {
            if (error) {
              setResult(JSON.stringify(error));
            }
          };
          stageView.open(input, callback);
        },
      },
    },
  });

const StageViewAPIs = (): ReactElement => (
  <>
    <h1>stageView</h1>
    <OpenStageView />
  </>
);

export default StageViewAPIs;
