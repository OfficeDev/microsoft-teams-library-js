import { video } from '@microsoft/teams-js';
import React from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const RegisterForVideoFrame = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoMediaStreamRegisterForVideoFrame',
    title: 'mediaStream.registerForVideoFrame',
    onClick: async (setResult) => {
      const onFrameCallback: video.mediaStream.VideoFrameCallback = async (frame) => {
        setResult('video frame received');
        return frame.videoFrame;
      };
      try {
        video.mediaStream.registerForVideoFrame(onFrameCallback);
      } catch (error) {
        return `Faild to register for video frame: ${JSON.stringify(error)}`;
      }
      return generateRegistrationMsg('it is invoked on video frame received');
    },
  });

const CheckIsSupported = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoMediaStreamIsSupported',
    title: 'video.mediaStream - isSupported',
    onClick: async () => {
      return `video.mediaStream is ${video.mediaStream.isSupported() ? 'supported' : 'not supported'}`;
    },
  });

const VideoAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Video.MediaStream">
    <CheckIsSupported />
    <RegisterForVideoFrame />
  </ModuleWrapper>
);

export default VideoAPIs;
