import { video } from '@microsoft/teams-js';
import React from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const RegisterForVideoFrame = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoSharedFrameRegisterForVideoFrame',
    title: 'sharedFrame.registerForVideoFrame',
    onClick: async (setResult) => {
      const onFrameCallback: video.sharedFrame.VideoFrameCallback = async () => {
        setResult('video frame received');
      };
      try {
        video.sharedFrame.registerForVideoFrame(onFrameCallback, { format: video.VideoFrameFormat.NV12 });
      } catch (error) {
        return `Faild to register for video frame: ${JSON.stringify(error)}`;
      }
      return generateRegistrationMsg('it is invoked on video frame received');
    },
  });

const CheckIsSupported = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoSharedFrameIsSupported',
    title: 'video.sharedFrame - isSupported',
    onClick: async () => {
      return `video.sharedFrame is ${video.sharedFrame.isSupported() ? 'supported' : 'not supported'}`;
    },
  });

const VideoAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Video.SharedFrame">
    <CheckIsSupported />
    <RegisterForVideoFrame />
  </ModuleWrapper>
);

export default VideoAPIs;
