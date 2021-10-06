import { media } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const MediaAPIs = (): ReactElement => {
  const [captureImageRes, setCaptureImageRes] = React.useState('');
  const [selectMediaRes, setSelectMediaRes] = React.useState('');
  const [getMediaRes, setGetMediaRes] = React.useState('');
  const [viewImagesWithIdRes, setViewImagesWithIdRes] = React.useState('');
  const [viewImagesWithUrlsRes, setViewImagesWithUrlsRes] = React.useState('');
  const [scanBarCodeRes, setScanBarCodeRes] = React.useState('');
  const [checkMediaCapabilityRes, setCheckMediaCapabilityRes] = React.useState('');

  const captureImage = (): void => {
    setCaptureImageRes('media.captureImage()' + noHubSdkMsg);
    media
      .captureImage()
      .then(files => {
        const file: media.File = files[0];
        let content = '';
        let len = 20;
        if (file.content) {
          len = Math.min(len, file.content.length);
          content = file.content.substr(0, len);
        }
        const output =
          'format: ' + file.format + ', size: ' + file.size + ', mimeType: ' + file.mimeType + ', content: ' + content;
        setCaptureImageRes(output);
      })
      .catch(error => setCaptureImageRes(error.errorCode.toString + ' ' + error.message));
  };

  const selectMedia = (mediaInputs: string): void => {
    const mediaInputsParams: media.MediaInputs = JSON.parse(mediaInputs);
    setSelectMediaRes('media.selectMedia()' + noHubSdkMsg);
    media
      .selectMedia(mediaInputsParams)
      .then(medias => {
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
          setSelectMediaRes(message);
        }
      })
      .catch(error => setSelectMediaRes(error.errorCode.toString + ' ' + error.message));
  };

  const getMedia = (mediaInputs: string): void => {
    const mediaInputsParams: media.MediaInputs = JSON.parse(mediaInputs);
    setGetMediaRes('media.getMedia()' + noHubSdkMsg);
    media
      .selectMedia(mediaInputsParams)
      .then(medias => {
        const media: media.Media = medias[0] as media.Media;
        return media.getMedia();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            setGetMediaRes('Received Blob (length: ' + (reader.result as any).length + ')');
          }
        };
      })
      .catch(error => setGetMediaRes(error.errorCode.toString + ' ' + error.message));
  };

  const viewImagesWithId = (mediaInputs: string): void => {
    const mediaInputsParams: media.MediaInputs = JSON.parse(mediaInputs);
    setViewImagesWithIdRes('media.viewImagesWithId()' + noHubSdkMsg);
    media
      .selectMedia(mediaInputsParams)
      .then(medias => {
        const urlList: media.ImageUri[] = [];
        for (let i = 0; i < medias.length; i++) {
          const media = medias[i];
          urlList.push({
            value: media.content,
            type: 1, //ImageUriType.ID
          } as media.ImageUri);
        }
        return media.viewImages(urlList);
      })
      .then(() => setViewImagesWithIdRes('Success'))
      .catch(err => setViewImagesWithIdRes(err.errorCode.toString + ' ' + err.message));
  };

  const viewImagesWithUrls = (imageUrlsInput: string): void => {
    setViewImagesWithUrlsRes('media.viewImagesWithUrls()' + noHubSdkMsg);
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

  const scanBarCode = (scanBarCodeConfigInput: string): void => {
    const scanBarCodeConfig: media.BarCodeConfig = JSON.parse(scanBarCodeConfigInput);
    setScanBarCodeRes('media.scanBarCode()' + noHubSdkMsg);
    media
      .scanBarCode(scanBarCodeConfig)
      .then(result => setScanBarCodeRes('result: ' + result))
      .catch(err => setScanBarCodeRes(err.errorCode.toString + ' ' + err.message));
  };

  const mediaCapabilityCheck = (): void => {
    if (media.isSupported()) {
      setCheckMediaCapabilityRes('Media module is supported');
    } else {
      setCheckMediaCapabilityRes('Media module is not supported');
    }
  };

  return (
    <>
      <h1>media</h1>
      <BoxAndButton
        handleClick={captureImage}
        output={captureImageRes}
        hasInput={false}
        title="Capture Image"
        name="CaptureImage"
      />
      <BoxAndButton
        handleClickWithInput={selectMedia}
        output={selectMediaRes}
        hasInput={true}
        title="Select Media"
        name="selectMedia"
      />
      <BoxAndButton
        handleClickWithInput={getMedia}
        output={getMediaRes}
        hasInput={true}
        title="Get Media"
        name="getMedia"
      />
      <BoxAndButton
        handleClickWithInput={viewImagesWithId}
        output={viewImagesWithIdRes}
        hasInput={true}
        title="View Images With Id"
        name="viewImagesWithId"
      />
      <BoxAndButton
        handleClickWithInput={viewImagesWithUrls}
        output={viewImagesWithUrlsRes}
        hasInput={true}
        title="View Images With Urls"
        name="viewImagesWithUrls"
      />
      <BoxAndButton
        handleClickWithInput={scanBarCode}
        output={scanBarCodeRes}
        hasInput={true}
        title="Media Scan Bar Code"
        name="mediaScanBarCode"
      />
      <BoxAndButton
        handleClick={mediaCapabilityCheck}
        output={checkMediaCapabilityRes}
        hasInput={false}
        title="Check Media Capability"
        name="checkMediaCapability"
      />
    </>
  );
};

export default MediaAPIs;
