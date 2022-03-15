import { SdkError, stageView } from '@microsoft/teams-js';
import { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';

const OpenStageView = (): ReactElement =>
  ApiWithTextInput({
    name: 'stageViewOpen',
    title: 'StageView Open',
    onClick: {
      validateInput: input => {
        console.log('input!!!!!!!: ', input);
        return input;
      },
      submit: {
        withPromise: async input => {
          await stageView.open(input);
          return 'opened';
        },
        withCallback: (input, setResult) => {
          const callback = (error: SdkError, result: string): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult('result: ' + result);
            }
          };
          stageView.open(callback, input);
        },
      },
    },
    defaultInput: JSON.stringify({
      appId: 'fe4a8eba-2a31-4737-8e33-e5fae6fee194',
      contentUrl: '',
      threadId: '',
      title: 'imma title',
    }),
  });

const StageViewAPIs = (): ReactElement => (
  <>
    <OpenStageView />
  </>
);

export default StageViewAPIs;
