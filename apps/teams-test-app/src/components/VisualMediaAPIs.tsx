import { visualMedia } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const imagesMessageBuilder = (medias: visualMedia.VisualMediaFile[]): string => {
  let message = '';
  for (const media of medias) {
    message += `[content: ${JSON.stringify(media.content)}, size: ${media.sizeInKB}, name: ${media.name}, mimeType: ${
      media.mimeType
    }],`;
  }
  return message;
};

const CaptureImages = (): React.ReactElement =>
  ApiWithTextInput<visualMedia.image.CameraImageProperties>({
    name: 'captureImages',
    title: 'Capture Images',
    onClick: {
      validateInput: (input) => {
        if (!input || !input.maxVisualMediaCount) {
          throw new Error('maxMediaCount are required');
        }
      },
      submit: async (input) => {
        const result = await visualMedia.image.captureImages(input);
        const output = imagesMessageBuilder(result);
        if (output == '') {
          return JSON.stringify(result);
        }
        return output;
      },
    },
    defaultInput: JSON.stringify({
      maxVisualMediaCount: 1,
      sourceProps: { source: visualMedia.Source.Camera, cameraRestriction: visualMedia.CameraRestriction.FrontOrRear },
    }),
  });

const UploadImages = (): React.ReactElement =>
  ApiWithTextInput<visualMedia.image.GalleryImageProperties>({
    name: 'uploadImages',
    title: 'Upload Images',
    onClick: {
      validateInput: (input) => {
        if (!input || !input.maxVisualMediaCount) {
          throw new Error('maxMediaCount are required');
        }
      },
      submit: async (input) => {
        const result = await visualMedia.image.retrieveImages(input);
        const output = imagesMessageBuilder(result);
        if (output == '') {
          return JSON.stringify(result);
        }
        return output;
      },
    },
    defaultInput: JSON.stringify({ maxVisualMediaCount: 1, sourceProps: { source: visualMedia.Source.Gallery } }),
  });

const HasVisualMediaPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hasVisualMediaPermission',
    title: 'Has Visual Media Permission',
    onClick: async () => {
      const result = await visualMedia.hasPermission();
      return JSON.stringify(result);
    },
  });

const RequestVisualMediaPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestVisualMediaPermission',
    title: 'Request Visual Media Permission',
    onClick: async () => {
      const result = await visualMedia.requestPermission();
      return JSON.stringify(result);
    },
  });

const CheckVisualMediaImageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkVisualMediaImageCapability',
    title: 'Check Visual Media Image Capability',
    onClick: async () => `VisualMedia.image module ${visualMedia.image.isSupported() ? 'is' : 'is not'} supported`,
  });

const VisualMediaAPIs = (): ReactElement => (
  <ModuleWrapper title="Visual Media">
    <CaptureImages />
    <UploadImages />
    <HasVisualMediaPermission />
    <RequestVisualMediaPermission />
    <CheckVisualMediaImageCapability />
  </ModuleWrapper>
);

export default VisualMediaAPIs;
