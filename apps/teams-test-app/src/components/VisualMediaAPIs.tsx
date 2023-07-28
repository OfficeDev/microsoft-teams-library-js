import { visualMedia } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const imagePreviewHelper = (item: string): string => {
  let output = '';
  let len = 20;
  if (item) {
    len = Math.min(len, item.length);
    output = item.substr(0, len);
  }
  return output;
};

const imagesHelper = (medias: visualMedia.VisualMediaFile[]): string => {
  let message = '';
  for (let i = 0; i < medias.length; i++) {
    const media: visualMedia.VisualMediaFile = medias[i];
    const preview = imagePreviewHelper(media.preview);
    message +=
      '[format: ' +
      media.format +
      ', size: ' +
      media.size +
      ', mimeType: ' +
      media.mimeType +
      ', content: ' +
      media.content +
      ', preview: ' +
      preview +
      '],';
  }
  return message;
};

const CaptureImages = (): React.ReactElement =>
  ApiWithTextInput<visualMedia.ImageProperties>({
    name: 'captureImages',
    title: 'Capture Images',
    onClick: {
      validateInput: (input) => {
        if (!input || !input.visualMediaCount) {
          throw new Error('maxMediaCount are required');
        }
      },
      submit: async (input) => {
        const result = await visualMedia.image.captureImages(input);
        const output = imagesHelper(result);
        if (output == '') {
          return JSON.stringify(result);
        }
        return output;
      },
    },
  });

const UploadImages = (): React.ReactElement =>
  ApiWithTextInput<visualMedia.ImageProperties>({
    name: 'uploadImages',
    title: 'Upload Images',
    onClick: {
      validateInput: (input) => {
        if (!input || !input.visualMediaCount) {
          throw new Error('maxMediaCount are required');
        }
      },
      submit: async (input) => {
        const result = await visualMedia.image.uploadImages(input);
        const output = imagesHelper(result);
        if (output == '') {
          return JSON.stringify(result);
        }
        return output;
      },
    },
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

const CheckVisualMediaCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkVisualMediaCapability',
    title: 'Check Visual Media Capability',
    onClick: async () => `visual media module ${visualMedia.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckVisualMediaImageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkVisualMediaImageCapability',
    title: 'Check Visual Media Image Capability',
    onClick: async () => `visual media image module ${visualMedia.image.isSupported() ? 'is' : 'is not'} supported`,
  });

const VisualMediaAPIs = (): ReactElement => (
  <ModuleWrapper title="Visual Media">
    <CaptureImages />
    <UploadImages />
    <HasVisualMediaPermission />
    <RequestVisualMediaPermission />
    <CheckVisualMediaCapability />
    <CheckVisualMediaImageCapability />
  </ModuleWrapper>
);

export default VisualMediaAPIs;
