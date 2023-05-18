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

const CheckIsSupported = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoIsSupported',
    title: 'video - isSupported',
    onClick: async () => {
      return `video is ${video.isSupported() ? 'supported' : 'not supported'}`;
    },
  });

const MediaStreamRegisterForVideoFrame = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoMediaStreamRegisterForVideoFrame',
    title: 'medisStream - registerForVideoFrame',
    onClick: async (setResult) => {
      try {
        video.registerForVideoFrame({
          videoFrameHandler: async (frame) => {
            setResult('video frame received');
            return frame.videoFrame;
          },
          videoBufferHandler: (buffer) => buffer,
          config: {
            format: video.VideoFrameFormat.NV12,
          },
        });
      } catch (error) {
        return `Faild to register for video frame: ${JSON.stringify(error)}`;
      }
      return generateRegistrationMsg('it is invoked on video frame received');
    },
  });

const SharedFrameRegisterForVideoFrame = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoSharedFrameRegisterForVideoFrame',
    title: 'sharedFrame - registerForVideoFrame',
    onClick: async (setResult) => {
      try {
        video.registerForVideoFrame({
          videoFrameHandler: async (frame) => {
            return frame.videoFrame;
          },
          videoBufferHandler: () => {
            setResult('video frame received');
          },
          config: {
            format: video.VideoFrameFormat.NV12,
          },
        });
      } catch (error) {
        return `Faild to register for video frame: ${JSON.stringify(error)}`;
      }
      return generateRegistrationMsg('it is invoked on video frame received');
    },
  });

const VideoAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Video">
    <NotifySelectedVideoEffectChanged />
    <RegisterForVideoEffect />
    <CheckIsSupported />
    <MediaStreamRegisterForVideoFrame />
    <SharedFrameRegisterForVideoFrame />
  </ModuleWrapper>
);

export default VideoAPIs;
