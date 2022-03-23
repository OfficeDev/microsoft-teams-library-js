import { media, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { SupportButton } from './utils/SupportButton/SupportButton';

const mediaHelper = (item: string): string => {
  let output = '';
  let len = 20;
  if (item) {
    len = Math.min(len, item.length);
    output = item.substr(0, len);
  }
  return output;
};

const captureImageHelper = (file: media.File): string => {
  const content = mediaHelper(file.content);
  const output =
    'format: ' + file.format + ', size: ' + file.size + ', mimeType: ' + file.mimeType + ', content: ' + content;

  return output;
};

const selectMediaHelper = (medias: media.Media[]): string => {
  let message = '';
  for (let i = 0; i < medias.length; i++) {
    const media: media.Media = medias[i];
    const preview = mediaHelper(media.preview);
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

const getMediaHelper = (blob: Blob, setResult: (result: string) => void): void => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => {
    if (reader.result) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      setResult('Received Blob (length: ' + (reader.result as any).length + ')');
    }
  };
};

const getUrlListFromId = (medias: media.Media[]): media.ImageUri[] => {
  const urlList: media.ImageUri[] = [];
  for (let i = 0; i < medias.length; i++) {
    const media = medias[i];
    urlList.push({
      value: media.content,
      type: 1, //ImageUriType.ID
    } as media.ImageUri);
  }

  return urlList;
};

const CaptureImage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CaptureImage',
    title: 'Capture Image',
    onClick: {
      withPromise: async () => {
        const result = await media.captureImage();
        const output = captureImageHelper(result[0]);
        return output;
      },
      withCallback: setResult => {
        const callback = (error?: SdkError, files?: media.File[]): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else if (files) {
            const output = captureImageHelper(files[0]);
            setResult(output);
          } else {
            setResult('Unsuccessful capture');
          }
        };
        media.captureImage(callback);
      },
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
      submit: {
        withPromise: async input => {
          const medias = await media.selectMedia(input);
          const output = selectMediaHelper(medias);
          return output;
        },
        withCallback: (input, setResult) => {
          const callback = (error: SdkError, medias: media.Media[]): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              const output = selectMediaHelper(medias);
              setResult(output);
            }
          };
          media.selectMedia(input, callback);
        },
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
      submit: {
        withPromise: async (input, setResult) => {
          const medias = await media.selectMedia(input);
          const mediaItem: media.Media = medias[0] as media.Media;
          const blob = await mediaItem.getMedia();
          getMediaHelper(blob, setResult);
          return 'media.getMedia()' + noHostSdkMsg;
        },
        withCallback: (input, setResult) => {
          const getMediaCallback = (error: SdkError, blob: Blob): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              getMediaHelper(blob, setResult);
            }
          };
          const selectMediaCallback = (error: SdkError, medias: media.Media[]): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              const mediaItem: media.Media = medias[0] as media.Media;
              mediaItem.getMedia(getMediaCallback);
            }
          };
          media.selectMedia(input, selectMediaCallback);
          return 'media.getMedia()' + noHostSdkMsg;
        },
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
      submit: {
        withPromise: async input => {
          const medias = await media.selectMedia(input);
          const urlList: media.ImageUri[] = getUrlListFromId(medias);
          await media.viewImages(urlList);
          return 'Success';
        },
        withCallback: (input, setResult) => {
          const viewImageCallback = (error?: SdkError): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult('Success');
            }
          };
          const selectMediaCallback = (error: SdkError, medias: media.Media[]): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              const urlList: media.ImageUri[] = getUrlListFromId(medias);
              media.viewImages(urlList, viewImageCallback);
            }
          };
          media.selectMedia(input, selectMediaCallback);
        },
      },
    },
  });

const ScanBarCode = (): ReactElement =>
  ApiWithTextInput<media.BarCodeConfig>({
    name: 'mediaScanBarCode',
    title: 'Media Scan Bar Code',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: () => {},
      submit: {
        withPromise: async input => {
          const result = await media.scanBarCode(input);
          return 'result: ' + result;
        },
        withCallback: (input, setResult) => {
          const callback = (error: SdkError, result: string): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult('result: ' + result);
            }
          };
          media.scanBarCode(callback, input);
        },
      },
    },
  });

const ViewImagesWithUrls = (): React.ReactElement =>
  ApiWithTextInput<string[]>({
    name: 'viewImagesWithUrls',
    title: 'View Images With Urls',
    onClick: {
      validateInput: input => {
        if (!input || !Array.isArray(input) || input.length === 0 || input.find(x => typeof x !== 'string')) {
          throw new Error('input has to be an array of strings with at least one element');
        }
      },
      submit: {
        withPromise: async input => {
          const urlList: media.ImageUri[] = input.map(x => ({ value: x, type: 2 /* ImageUriType.ID */ }));
          await media.viewImages(urlList);
          return 'media.viewImagesWithUrls() executed';
        },
        withCallback: (input, setResult) => {
          const callback = (error?: SdkError): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult('media.viewImagesWithUrls() executed');
            }
          };
          const urlList: media.ImageUri[] = input.map(x => ({ value: x, type: 2 /* ImageUriType.ID */ }));
          media.viewImages(urlList, callback);
        },
      },
    },
  });

const MediaCapability = (): React.ReactElement =>
  SupportButton({
    name: 'mediaCapability',
    module: 'Media',
    isSupported: media.isSupported(),
  });

const MediaAPIs = (): ReactElement => (
  <>
    <h1>media</h1>
    <MediaCapability />
    <CaptureImage />
    <SelectMedia />
    <GetMedia />
    <ViewImagesWithId />
    <ViewImagesWithUrls />
    <ScanBarCode />
  </>
);

export default MediaAPIs;
