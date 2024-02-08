import { videoEffects } from '@microsoft/teams-js';
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
        videoEffects.notifySelectedVideoEffectChanged(videoEffects.EffectChangeType.EffectChanged, input);
        return 'Success';
      },
    },
    defaultInput: '"anEffectId"',
  });

const RegisterForVideoEffect = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerForVideoEffect',
    title: 'registerForVideoEffect',
    onClick: async (setResult) => {
      const onVideoEffectChanged = async (effectId: string | undefined): Promise<void> => {
        if (effectId === 'anInvalidEffectId') {
          setResult(`failed to change effect to ${JSON.stringify(effectId)}`);
          throw videoEffects.EffectFailureReason.InvalidEffectId;
        } else {
          setResult(`video effect changed to ${JSON.stringify(effectId)}`);
        }
      };
      videoEffects.registerForVideoEffect(onVideoEffectChanged);
      return generateRegistrationMsg('it is invoked on video effect changed');
    },
  });

const CheckIsSupported = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoIsSupported',
    title: 'video - isSupported',
    onClick: async () => {
      return `video is ${videoEffects.isSupported() ? 'supported' : 'not supported'}`;
    },
  });

const MediaStreamRegisterForVideoFrame = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoMediaStreamRegisterForVideoFrame',
    title: 'medisStream - registerForVideoFrame',
    onClick: async (setResult) => {
      try {
        videoEffects.registerForVideoFrame({
          videoFrameHandler: async (frame) => {
            setResult('video frame received');
            return frame.videoFrame;
          },
          videoBufferHandler: (buffer) => buffer,
          config: {
            format: videoEffects.VideoFrameFormat.NV12,
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
        videoEffects.registerForVideoFrame({
          videoFrameHandler: async (frame) => {
            return frame.videoFrame;
          },
          videoBufferHandler: () => {
            setResult('video frame received');
          },
          config: {
            format: videoEffects.VideoFrameFormat.NV12,
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
