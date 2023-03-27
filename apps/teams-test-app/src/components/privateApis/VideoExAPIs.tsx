import { video, videoEx } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const UpdatePersonalizedEffects = (): React.ReactElement =>
  ApiWithTextInput({
    name: 'updatePersonalizedEffects',
    title: 'updatePersonalizedEffects',
    onClick: {
      validateInput: (input) => {
        if (!input || !Array.isArray(input)) {
          throw new Error('input is required and it has to be an array.');
        }
      },
      submit: async (input: videoEx.PersonalizedEffect[]) => {
        videoEx.updatePersonalizedEffects(input);
        return 'Success';
      },
    },
  });

const NotifySelectedVideoEffectChanged = (): React.ReactElement =>
  ApiWithTextInput({
    name: 'videoExNotifySelectedVideoEffectChanged',
    title: 'VideoEx - notifySelectedVideoEffectChanged',
    onClick: {
      validateInput: (input) => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: async (input: string) => {
        const [effectId, effectParam] = input.split(',').map((item) => item.trim());
        videoEx.notifySelectedVideoEffectChanged(video.EffectChangeType.EffectChanged, effectId, effectParam);
        return 'Success';
      },
    },
  });

const VideoExAPIs = (): React.ReactElement => (
  <ModuleWrapper title="VideoEx">
    <UpdatePersonalizedEffects />
    <NotifySelectedVideoEffectChanged />
  </ModuleWrapper>
);

export default VideoExAPIs;
