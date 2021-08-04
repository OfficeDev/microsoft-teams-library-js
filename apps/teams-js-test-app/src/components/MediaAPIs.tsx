import React, { ReactElement } from 'react';
import { media, SdkError } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

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
    const callback = (error: SdkError, files: media.File[]): void => {
      if (error) {
        setCaptureImageRes(error.errorCode.toString + ' ' + error.message);
        return;
      }
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
    };
    media.captureImage(callback);
  };

  const selectMedia = (mediaInputs: string): void => {
    const mediaInputsParams: media.MediaInputs = JSON.parse(mediaInputs);
    setSelectMediaRes('media.selectMedia()' + noHubSdkMsg);
    const callback = (error: SdkError, medias: media.Media[]): void => {
      if (error) {
        setSelectMediaRes(error.errorCode.toString + ' ' + error.message);
        return;
      }
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
    };
    media.selectMedia(mediaInputsParams, callback);
  };

  const getMedia = (mediaInputs: string): void => {
    const mediaInputsParams: media.MediaInputs = JSON.parse(mediaInputs);
    setGetMediaRes('media.getMedia()' + noHubSdkMsg);
    media.selectMedia(mediaInputsParams, (error: SdkError, medias: media.Media[]) => {
      if (error) {
        setGetMediaRes(error.errorCode.toString + ' ' + error.message);
        return;
      }
      const media: media.Media = medias[0] as media.Media;
      media.getMedia((gmErr: SdkError, blob: Blob) => {
        if (gmErr) {
          setGetMediaRes(gmErr.errorCode.toString + ' ' + gmErr.message);
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            setGetMediaRes('Received Blob (length: ' + (reader.result as any).length + ')');
          }
        };
      });
    });
  };

  const viewImagesWithId = (mediaInputs: string): void => {
    const mediaInputsParams: media.MediaInputs = JSON.parse(mediaInputs);
    setViewImagesWithIdRes('media.viewImagesWithId()' + noHubSdkMsg);
    media.selectMedia(mediaInputsParams, (err: SdkError, medias: media.Media[]) => {
      if (err) {
        setViewImagesWithIdRes(err.errorCode.toString + ' ' + err.message);
        return;
      }
      const urlList: media.ImageUri[] = [];
      for (let i = 0; i < medias.length; i++) {
        const media = medias[i];
        urlList.push({
          value: media.content,
          type: 1, //ImageUriType.ID
        } as media.ImageUri);
      }
      media.viewImages(urlList, (gmErr?: SdkError): void => {
        if (gmErr) {
          setViewImagesWithIdRes(gmErr.errorCode.toString + ' ' + gmErr.message);
          return;
        }
        setViewImagesWithIdRes('Success');
      });
    });
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
    media.viewImages(urlList, (err?: SdkError): void => {
      if (err) {
        setViewImagesWithUrlsRes(err.errorCode.toString + ' ' + err.message);
      } else {
        setViewImagesWithUrlsRes('media.viewImagesWithUrls() executed');
      }
    });
  };

  const scanBarCode = (scanBarCodeConfigInput: string): void => {
    const scanBarCodeConfig: media.BarCodeConfig = JSON.parse(scanBarCodeConfigInput);
    setScanBarCodeRes('media.scanBarCode()' + noHubSdkMsg);
    media.scanBarCode((err: SdkError, result: string): void => {
      if (err) {
        setScanBarCodeRes(err.errorCode.toString + ' ' + err.message);
      } else {
        setScanBarCodeRes('result: ' + result);
      }
    }, scanBarCodeConfig);
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
