import { /*SdkError,*/ stageView } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput /*, ApiWithTextInput*/ } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckStageViewSelfCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkStageViewSelfCapability',
    title: 'Check StageView Self Capability',
    onClick: async () => `StageView Self ${stageView.isSupported() ? 'is' : 'is not'} supported`,
  });

const CloseStageView = (): ReactElement =>
  ApiWithoutInput({
    name: 'stageViewSelfClose',
    title: 'StageView Self Close',
    onClick: async () => {
      await stageView.self.close();
      return 'closed';
    },
  });

const StageViewSelfAPIs = (): ReactElement => (
  <ModuleWrapper title="StageViewSelf">
    <CloseStageView />
    <CheckStageViewSelfCapability />
  </ModuleWrapper>
);

export default StageViewSelfAPIs;
