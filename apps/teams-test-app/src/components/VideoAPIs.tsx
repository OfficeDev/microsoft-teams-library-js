import { video } from '@microsoft/teams-js';
import React from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NotifySelectedVideoEffectChanged = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'notifySelectedVideoEffectChanged',
    title: 'videoEffectPickedInVideoApp',
    onClick: {
      validateInput: (input) => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: async (input) => {
        video.notifySelectedVideoEffectChanged(video.EffectChangeType.EffectChanged, input);
        return 'Success';
      },
    },
  });

const RegisterForVideoEffect = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerForVideoEffect',
    title: 'registerForVideoEffect',
    onClick: async (setResult) => {
      const onVideoEffectChanged = async (effectId: string | undefined): Promise<void> => {
        if (effectId === 'anInvalidEffectId') {
          setResult(`failed to change effect to ${JSON.stringify(effectId)}`);
          throw video.EffectFailureReason.InvalidEffectId;
        } else {
          setResult(`video effect changed to ${JSON.stringify(effectId)}`);
        }
      };
      video.registerForVideoEffect(onVideoEffectChanged);
      return generateRegistrationMsg('it is invoked on video effect changed');
    },
  });

// const RegisterForVideoFrame = (): React.ReactElement =>
//   ApiWithoutInput({
//     name: 'registerForVideoFrame',
//     title: 'registerForVideoFrame',
//     onClick: async (setResult) => {
//       if (video.mediaStream.isSupported()) {
//         const onVideoFrame = async (frame: video.mediaStream.MediaStreamFrameData): Promise<void> => {
//           const { videoFrame } = frame;
//           setResult('video frame received');
//           return videoFrame;
//         };
//         video.mediaStream.registerForVideoFrame(onVideoFrame);
//       } else if (video.sharedFrame.isSupported()) {
//         const onNewVideoFrame = async (): Promise<void> => {
//           setResult('video frame received');
//         };
//         video.sharedFrame.registerForVideoFrame(onNewVideoFrame, { format: video.VideoFrameFormat.NV12 });
//       }
//       return generateRegistrationMsg('it is invoked on video frame received');
//     },
//   });

const VideoAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Video">
    <NotifySelectedVideoEffectChanged />
    <RegisterForVideoEffect />
    {/* <RegisterForVideoFrame /> */}
  </ModuleWrapper>
);

export default VideoAPIs;
