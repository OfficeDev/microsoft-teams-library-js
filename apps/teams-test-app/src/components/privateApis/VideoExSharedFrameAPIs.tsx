import { video, videoEx } from '@microsoft/teams-js';
import React from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const RegisterForVideoFrame = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoExSharedFrameRegisterForVideoFrame',
    title: 'sharedFrame.registerForVideoFrame',
    onClick: async (setResult) => {
      const onFrameCallback: videoEx.sharedFrame.VideoFrameCallback = async () => {
        setResult('video frame received');
      };
      try {
        const audioInferenceModel = new ArrayBuffer(8);
        const view = new Uint8Array(audioInferenceModel);
        for (let i = 0; i < view.length; i++) {
          view[i] = i;
        }
        videoEx.sharedFrame.registerForVideoFrame(onFrameCallback, {
          format: video.VideoFrameFormat.NV12,
          requireCameraStream: false,
          audioInferenceModel,
        });
      } catch (error) {
        return `Faild to register for video frame: ${JSON.stringify(error)}`;
      }
      return generateRegistrationMsg('it is invoked on video frame received');
    },
  });

const CheckIsSupported = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoExSharedFrameIsSupported',
    title: 'videoEx.sharedFrame - isSupported',
    onClick: async () => {
      return `videoEx.sharedFrame is ${videoEx.sharedFrame.isSupported() ? 'supported' : 'not supported'}`;
    },
  });

const VideoAPIs = (): React.ReactElement => (
  <ModuleWrapper title="VideoEx.SharedFrame">
    <CheckIsSupported />
    <RegisterForVideoFrame />
  </ModuleWrapper>
);

export default VideoAPIs;
