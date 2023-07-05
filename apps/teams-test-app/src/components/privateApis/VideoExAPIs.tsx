import { video, videoEx } from '@microsoft/teams-js';
import React from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
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

const RegisterForVideoEffect = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoExRegisterForVideoEffect',
    title: 'videoEx - registerForVideoEffect',
    onClick: async (setResult) => {
      const onVideoEffectChanged = async (effectId: string | undefined, effectParam?: string): Promise<void> => {
        if (effectId === 'anInvalidEffectId') {
          setResult(`failed to change effect to ${JSON.stringify(effectId)}, param: ${JSON.stringify(effectParam)}`);
          throw video.EffectFailureReason.InvalidEffectId;
        } else {
          setResult(
            `video effect changed to ${JSON.stringify(effectId)}, effect param: ${JSON.stringify(effectParam)}`,
          );
        }
      };
      videoEx.registerForVideoEffect(onVideoEffectChanged);
      return generateRegistrationMsg('it is invoked on video effect changed');
    },
  });

const NotifyFatalError = (): React.ReactElement =>
  ApiWithTextInput({
    name: 'videoExNotifyFatalError',
    title: 'VideoEx - notifyFatalError',
    onClick: {
      validateInput: (input) => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: async (input: string) => {
        videoEx.notifyFatalError(input);
        return 'Success';
      },
    },
  });

const CheckIsSupported = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoExIsSupported',
    title: 'videoEx - isSupported',
    onClick: async () => {
      return `videoEx is ${videoEx.isSupported() ? 'supported' : 'not supported'}`;
    },
  });

const MediaStreamRegisterForVideoFrame = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoExMediaStreamRegisterForVideoFrame',
    title: 'medisStream - registerForVideoFrame',
    onClick: async (setResult) => {
      try {
        const audioInferenceModel = new ArrayBuffer(8);
        const view = new Uint8Array(audioInferenceModel);
        for (let i = 0; i < view.length; i++) {
          view[i] = i;
        }
        videoEx.registerForVideoFrame({
          videoFrameHandler: async (frame) => {
            setResult('video frame received');
            return frame.videoFrame;
          },
          videoBufferHandler: (buffer) => buffer,
          config: {
            format: video.VideoFrameFormat.NV12,
            requireCameraStream: false,
            audioInferenceModel,
          },
        });
      } catch (error) {
        return `Failed to register for video frame: ${JSON.stringify(error)}`;
      }
      return generateRegistrationMsg('it is invoked on video frame received');
    },
  });

// To be removed, use the one below with typo fix
const SharedFrameRegisterForVideoFrameToBeRemoved = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'videoExSharedFrameRegisterForVideoFrame',
    title: 'sharedFrame - registerForVideoFrame',
    onClick: async (setResult) => {
      try {
        const audioInferenceModel = new ArrayBuffer(8);
        const view = new Uint8Array(audioInferenceModel);
        for (let i = 0; i < view.length; i++) {
          view[i] = i;
        }
        videoEx.registerForVideoFrame({
          videoFrameHandler: async (frame) => {
            return frame.videoFrame;
          },
          videoBufferHandler: () => {
            setResult('video frame received');
          },
          config: {
            format: video.VideoFrameFormat.NV12,
            requireCameraStream: false,
            audioInferenceModel,
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
    name: 'videoExSharedFrameRegisterForVideoFrame1',
    title: 'sharedFrame - registerForVideoFrame',
    onClick: async (setResult) => {
      try {
        const audioInferenceModel = new ArrayBuffer(8);
        const view = new Uint8Array(audioInferenceModel);
        for (let i = 0; i < view.length; i++) {
          view[i] = i;
        }
        videoEx.registerForVideoFrame({
          videoFrameHandler: async (frame) => {
            return frame.videoFrame;
          },
          videoBufferHandler: () => {
            setResult('video frame received');
          },
          config: {
            format: video.VideoFrameFormat.NV12,
            requireCameraStream: false,
            audioInferenceModel,
          },
        });
      } catch (error) {
        return `Failed to register for video frame: ${JSON.stringify(error)}`;
      }
      return generateRegistrationMsg('it is invoked on video frame received');
    },
  });

const VideoExAPIs = (): React.ReactElement => (
  <ModuleWrapper title="VideoEx">
    <UpdatePersonalizedEffects />
    <NotifySelectedVideoEffectChanged />
    <RegisterForVideoEffect />
    <MediaStreamRegisterForVideoFrame />
    <SharedFrameRegisterForVideoFrameToBeRemoved />
    <SharedFrameRegisterForVideoFrame />
    <NotifyFatalError />
    <CheckIsSupported />
  </ModuleWrapper>
);

export default VideoExAPIs;
