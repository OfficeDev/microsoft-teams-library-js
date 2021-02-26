import React, { ReactElement } from 'react';
import { media } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const MediaAPIs = (): ReactElement => {
  const [captureImageRes, setCaptureImageRes] = React.useState('');
  const [selectMediaRes, setSelectMediaRes] = React.useState('');
  const [getMediaRes, setGetMediaRes] = React.useState('');
  const [viewImagesWithIdRes, setViewImagesWithIdRes] = React.useState('');
  const [viewImagesWithUrlsRes, setViewImagesWithUrlsRes] = React.useState('');
  const [scanBarCodeRes, setScanBarCodeRes] = React.useState('');

  const captureImage = (): void => {
    setCaptureImageRes('media.captureImage()' + noHubSdkMsg);
    const callback = (error: teamsjs.SdkError, files: media.File[]): void => {
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
      let output =
        'format: ' + file.format + ', size: ' + file.size + ', mimeType: ' + file.mimeType + ', content: ' + content;
      setCaptureImageRes(output);
    };
    media.captureImage(callback);
  };

  const selectMedia = (mediaInputs: any): void => {
    setSelectMediaRes('media.selectMedia()' + noHubSdkMsg);
    const callback = (error: teamsjs.SdkError, medias: media.Media[]): void => {
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
    media.selectMedia(mediaInputs, callback);
  };

  const getMedia = (inputParams: any): void => {
    setGetMediaRes('media.getMedia()' + noHubSdkMsg);
    media.selectMedia(inputParams, (error: teamsjs.SdkError, medias: media.Media[]) => {
      if (error) {
        setGetMediaRes(error.errorCode.toString + ' ' + error.message);
        return;
      }
      const media: media.Media = medias[0] as media.Media;
      media.getMedia((gmErr: teamsjs.SdkError, blob: Blob) => {
        if (gmErr) {
          setGetMediaRes(gmErr.errorCode.toString + ' ' + gmErr.message);
          return;
        }
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            setGetMediaRes('Received Blob');
          }
        };
      });
    });
  };

  const viewImagesWithId = (selectMediaInputs: any): void => {
    setViewImagesWithIdRes('media.viewImagesWithId()' + noHubSdkMsg);
    media.selectMedia(selectMediaInputs, (err: teamsjs.SdkError, medias: media.Media[]) => {
      if (err) {
        setViewImagesWithIdRes(err.errorCode.toString + ' ' + err.message);
        return;
      }
      const urlList: media.ImageUri[] = [];
      for (let i = 0; i < medias.length; i++) {
        const media = medias[i];
        urlList.push({
          value: media.content,
          type: 1, //teamsjs.ImageUriType.ID
        } as media.ImageUri);
      }
      media.viewImages(urlList, (gmErr?: teamsjs.SdkError): void => {
        if (gmErr) {
          setViewImagesWithIdRes(gmErr.errorCode.toString + ' ' + gmErr.message);
          return;
        }
        setViewImagesWithIdRes('Success');
      });
    });
  };

  const viewImagesWithUrls = (imageUrls: any): void => {
    setViewImagesWithUrlsRes('media.viewImagesWithUrls()' + noHubSdkMsg);
    const urlList: media.ImageUri[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      urlList.push({
        value: imageUrl,
        type: 2, //teamsjs.ImageUriType.URL
      } as media.ImageUri);
    }
    media.viewImages(urlList, (err?: teamsjs.SdkError): void => {
      if (err) {
        setViewImagesWithUrlsRes(err.errorCode.toString + ' ' + err.message);
      } else {
        setViewImagesWithUrlsRes('media.viewImagesWithUrls() executed');
      }
    });
  };

  const scanBarCode = (scanBarCodeConfig: any): void => {
    setScanBarCodeRes('media.scanBarCode()' + noHubSdkMsg);
    media.scanBarCode((err: teamsjs.SdkError, result: string): void => {
      if (err) {
        setScanBarCodeRes(err.errorCode.toString + ' ' + err.message);
      } else {
        setScanBarCodeRes('result: ' + result);
      }
    }, scanBarCodeConfig);
  };

  return (
    <>
      <BoxAndButton
        handleClick={captureImage}
        output={captureImageRes}
        hasInput={false}
        title="Capture Image"
        name="CaptureImage"
      />
      <BoxAndButton
        handleClick={selectMedia}
        output={selectMediaRes}
        hasInput={true}
        title="Select Media"
        name="selectMedia"
      />
      <BoxAndButton handleClick={getMedia} output={getMediaRes} hasInput={true} title="Get Media" name="getMedia" />
      <BoxAndButton
        handleClick={viewImagesWithId}
        output={viewImagesWithIdRes}
        hasInput={true}
        title="View Images With Id"
        name="viewImagesWithId"
      />
      <BoxAndButton
        handleClick={viewImagesWithUrls}
        output={viewImagesWithUrlsRes}
        hasInput={true}
        title="View Images With Urls"
        name="viewImagesWithUrls"
      />
      <BoxAndButton
        handleClick={scanBarCode}
        output={scanBarCodeRes}
        hasInput={true}
        title="Media Scan Bar Code"
        name="mediaScanBarCode"
      />
    </>
  );
};

export default MediaAPIs;
