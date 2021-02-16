import React from 'react';
import { media } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const MediaAPIs = () => {
  const [getCaptureImage, setCaptureImage] = React.useState("");
  const [getSelectMedia, setSelectMedia] = React.useState("");
  const [getGetMedia, setGetMedia] = React.useState("");
  const [getViewImagesWithId, setViewImagesWithId] = React.useState("");
  const [getViewImagesWithUrls, setViewImagesWithUrls] = React.useState("");
  const [getMediaScanBarCode, setMediaScanBarCode] = React.useState("");

  const returnCaptureImage = () => {
    setCaptureImage("media.captureImage()" + noHubSdkMsg);
    const callback = (error: teamsjs.SdkError, files: media.File[]) => {
      if (error) {
        setCaptureImage(error.errorCode.toString + " " + error.message);
        return;
      }
      const file: media.File = files[0];
      let content: string = "";
      let len = 20;
      if (file.content) {
        len = Math.min(len, file.content.length);
        content = file.content.substr(0, len);
      }
      let output = "format: " + file.format + ", size: " + file.size + ", mimeType: " + file.mimeType + ", content: " + content;
      setCaptureImage(output);
    };
    media.captureImage(callback);
  };

  const returnSelectMedia = (mediaInputs: any) => {
    setSelectMedia("media.selectMedia()" + noHubSdkMsg);
    const callback = (error: teamsjs.SdkError, medias: media.Media[]) => {
      if (error) {
        setSelectMedia(error.errorCode.toString + " " + error.message);
        return;
      }
      let message = "";
      for (let i = 0; i < medias.length; i++) {
        const media: media.Media = medias[i];
        let preview: string = "";
        let len = 20;
        if (media.preview) {
          len = Math.min(len, media.preview.length);
          preview = media.preview.substr(0, len);
        }
        message += "[format: " + media.format + ", size: " + media.size
          + ", mimeType: " + media.mimeType + ", content: " + media.content
          + ", preview: " + preview + "],"
        setSelectMedia(message);
      }
    };
    media.selectMedia(mediaInputs, callback);
  };

  const returnGetMedia = (inputParams: any) => {
    setGetMedia("media.getMedia()" + noHubSdkMsg);
    media.selectMedia(inputParams, (error: teamsjs.SdkError, medias: media.Media[]) => {
      if (error) {
        setGetMedia(error.errorCode.toString + " " + error.message);
        return;
      }
      const media: media.Media = medias[0] as media.Media;
      media.getMedia((gmErr: teamsjs.SdkError, blob: Blob) => {
        if (gmErr) {
          setGetMedia(gmErr.errorCode.toString + " " + gmErr.message);
          return;
        }
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            setGetMedia("Received Blob");
          }
        }
      });
    });
  };

  const returnViewImagesWithId = (selectMediaInputs: any) => {
    setViewImagesWithId("media.viewImagesWithId()" + noHubSdkMsg);
    media.selectMedia(selectMediaInputs, (err: teamsjs.SdkError, medias: media.Media[]) => {
      if (err) {
        setViewImagesWithId(err.errorCode.toString + " " + err.message);
        return;
      }
      const urlList: media.ImageUri[] = [];
      for (let i = 0; i < medias.length; i++) {
        const media = medias[i];
        urlList.push({
          value: media.content,
          type: 1 //teamsjs.ImageUriType.ID
        } as media.ImageUri)
      }
      media.viewImages(urlList, (gmErr?: teamsjs.SdkError) => {
        if (gmErr) {
          setViewImagesWithId(gmErr.errorCode.toString + " " + gmErr.message);
          return;
        }
        setViewImagesWithId("Success");
      });
    });
  };

  const returnViewImagesWithUrls = (imageUrls: any) => {
    setViewImagesWithUrls("media.viewImagesWithUrls()" + noHubSdkMsg);
    const urlList: media.ImageUri[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      urlList.push({
        value: imageUrl,
        type: 2 //teamsjs.ImageUriType.URL
      } as media.ImageUri)
    }
    media.viewImages(urlList, (err?: teamsjs.SdkError) => {
      if (err) {
        setViewImagesWithUrls(err.errorCode.toString + " " + err.message);
        return;
      }
      setViewImagesWithUrls("Success");
    });
  };

  const returnMediaScanBarCode = (scanBarCodeConfig: any) => {
    setMediaScanBarCode("media.scanBarCode()" + noHubSdkMsg);
    media.scanBarCode((err: teamsjs.SdkError, result: string) => {
      if (err) {
        setMediaScanBarCode(err.errorCode.toString + " " + err.message);
        return;
      }
      setMediaScanBarCode("result: " + result);
    }, scanBarCodeConfig);
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnCaptureImage}
        output={getCaptureImage}
        hasInput={false}
        title="Capture Image"
        name="CaptureImage"
      />
      <BoxAndButton
        handleClick={returnSelectMedia}
        output={getSelectMedia}
        hasInput={true}
        title="Select Media"
        name="selectMedia"
      />
      <BoxAndButton
        handleClick={returnGetMedia}
        output={getGetMedia}
        hasInput={true}
        title="Get Media"
        name="getMedia"
      />
      <BoxAndButton
        handleClick={returnViewImagesWithId}
        output={getViewImagesWithId}
        hasInput={true}
        title="View Images With Id"
        name="viewImagesWithId"
      />
      <BoxAndButton
        handleClick={returnViewImagesWithUrls}
        output={getViewImagesWithUrls}
        hasInput={true}
        title="View Images With Urls"
        name="viewImagesWithUrls"
      />
      <BoxAndButton
        handleClick={returnMediaScanBarCode}
        output={getMediaScanBarCode}
        hasInput={true}
        title="Media Scan Bar Code"
        name="mediaScanBarCode"
      />
    </>
  );
};

export default MediaAPIs;
