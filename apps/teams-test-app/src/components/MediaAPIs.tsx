import { media } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';
import { ApiWithoutInput, ApiWithTextInput } from './utils';

const CaptureImage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CaptureImage',
    title: 'Capture Image',
    onClick: async () => {
      const result = await media.captureImage();
      const file: media.File = result[0];
      let content = '';
      let len = 20;
      if (file.content) {
        len = Math.min(len, file.content.length);
        content = file.content.substr(0, len);
      }
      const output =
        'format: ' + file.format + ', size: ' + file.size + ', mimeType: ' + file.mimeType + ', content: ' + content;
      return output;
    },
  });

const SelectMedia = (): React.ReactElement =>
  ApiWithTextInput<media.MediaInputs>({
    name: 'selectMedia',
    title: 'Select Media',
    onClick: {
      validateInput: input => {
        if (!input.mediaType || !input.maxMediaCount) {
          throw new Error('mediaType and maxMediaCount are required');
        }
      },
      submit: async input => {
        const medias = await media.selectMedia(input);
        let message = '';
        for (let i = 0; i < medias.length; i++) {
          const media: media.Media = medias[i];
          let preview = '';
          let len = 20;
          if (media.preview) {
            len = Math.min(len, media.preview.length);
            preview = media.preview.substr(0, len);
          }
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
      },
    },
  });

const GetMedia = (): React.ReactElement =>
  ApiWithTextInput<media.MediaInputs>({
    name: 'getMedia',
    title: 'Get Media',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: () => {},
      submit: async (input, setResult) => {
        const medias = await media.selectMedia(input);
        const mediaItem: media.Media = medias[0] as media.Media;
        const blob = await mediaItem.getMedia();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            setResult('Received Blob (length: ' + (reader.result as any).length + ')');
          }
        };
        return 'media.getMedia()' + noHostSdkMsg;
      },
    },
  });

const ViewImagesWithId = (): React.ReactElement =>
  ApiWithTextInput<media.MediaInputs>({
    name: 'viewImagesWithId',
    title: 'View Images With Id',
    onClick: {
      validateInput: input => {
        if (!input.mediaType || !input.maxMediaCount) {
          throw new Error('mediaType and maxMediaCount are required');
        }
      },
      submit: async input => {
        const medias = await media.selectMedia(input);

        const urlList: media.ImageUri[] = [];
        for (let i = 0; i < medias.length; i++) {
          const media = medias[i];
          urlList.push({
            value: media.content,
            type: 1, //ImageUriType.ID
          } as media.ImageUri);
        }
        await media.viewImages(urlList);
        return 'Success';
      },
    },
  });

const ScanBarCode = (): ReactElement =>
  ApiWithTextInput<media.BarCodeConfig>({
    name: 'mediaScanBarCode',
    title: 'Media Scan Bar Code',
    onClick: async input => {
      const result = await media.scanBarCode(input);
      return 'result: ' + result;
    },
  });

const ViewImagesWithUrls = (): React.ReactElement =>
  ApiWithTextInput<string[]>({
    name: 'viewImagesWithUrls2',
    title: 'View Images With Urls',
    onClick: {
      validateInput: input => {
        if (!input || !Array.isArray(input) || input.length === 0 || input.find(x => typeof x !== 'string')) {
          throw new Error('input has to be an array of strings with at least one element');
        }
      },
      submit: async input => {
        const urlList: media.ImageUri[] = input.map(x => ({ value: x, type: 2 }));
        await media.viewImages(urlList);
        return 'media.viewImagesWithUrls() executed';
      },
    },
  });

const CheckMediaCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMediaCapability',
    title: 'Check Media Call',
    onClick: async () => `Media module ${media.isSupported() ? 'is' : 'is not'} supported`,
  });

const MediaAPIs = (): ReactElement => {
  // TODO: Remove once E2E scenario tests are updated to use the new version
  const [viewImagesWithUrlsRes, setViewImagesWithUrlsRes] = React.useState('');

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const viewImagesWithUrls = (imageUrlsInput: string): void => {
    setViewImagesWithUrlsRes('media.viewImagesWithUrls()' + noHostSdkMsg);
    const imageUrls: string[] = imageUrlsInput.split(', ');
    const urlList: media.ImageUri[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      urlList.push({
        value: imageUrl,
        type: 2, //ImageUriType.URL
      } as media.ImageUri);
    }
    media
      .viewImages(urlList)
      .then(() => setViewImagesWithUrlsRes('media.viewImagesWithUrls() executed'))
      .catch(err => setViewImagesWithUrlsRes(err.errorCode.toString + ' ' + err.message));
  };
  return (
    <>
      <h1>media</h1>
      <CaptureImage />
      <SelectMedia />
      <GetMedia />
      <ViewImagesWithId />
      <ViewImagesWithUrls />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={viewImagesWithUrls}
        output={viewImagesWithUrlsRes}
        hasInput={true}
        title="View Images With Urls"
        name="viewImagesWithUrls"
      />
      <ScanBarCode />
      <CheckMediaCapability />
    </>
  );
};

export default MediaAPIs;
