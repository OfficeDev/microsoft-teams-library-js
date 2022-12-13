import { FluentProvider, Spinner, teamsLightTheme, Theme } from '@fluentui/react-components';
import { app, video } from '@microsoft/teams-js';
import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [currTheme, setCurrTheme] = useState<Theme>(teamsLightTheme);

  const videoExtensibilityTest = useCallback((): void => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    const simpleHalfEffect = (frame: VideoFrame): VideoFrame => {
      //console.log('simpleHalfEffect', frame.timestamp, frame.codedHeight, frame.codedWidth, frame.allocationSize());
      if (!ctx) {
        console.log('simpleHalfEffect: ctx is null');
        frame.close();
        return frame;
      }
      const width = frame.codedWidth;
      const height = frame.codedHeight;
      canvas.width = width;
      canvas.height = height;
      const timestamp = frame.timestamp || undefined;
      ctx?.drawImage(frame, 0, 0);
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 50;
      ctx.strokeStyle = '#000';
      ctx.strokeRect(0, 0, width, height);
      return new VideoFrame(canvas, { timestamp });
    };

    video.registerForVideoEffect((effectId) => {
      alert(`Video effect ${effectId} is selected`);
      return Promise.resolve();
    });

    video.registerForVideoFrameV2((receivedFrame) => {
      const frame = receivedFrame.frame;
      //console.log('receivedFrame', frame.timestamp, frame.codedHeight, frame.codedWidth, frame.allocationSize());
      return Promise.resolve(simpleHalfEffect(frame));
    });

    /*
    video.getVideoStream({ format: video.VideoFrameFormat.NV12 }).then((response: video.MediaStreamResponse) => {
      let frames = 0;
      let startTime = 0;
      const { mediaStream, registerOutputStreamTrack } = response;
      console.log('mediaStream', mediaStream.active);
      const videoTrack = mediaStream.getVideoTracks()[0];
      console.log('videoTrack', videoTrack);
      const processor = new MediaStreamTrackProcessor({ track: videoTrack as MediaStreamVideoTrack });
      const generator = new MediaStreamTrackGenerator({ kind: 'video' });
      const source = processor.readable;
      const sink = generator.writable;
      source
        .pipeThrough(
          new TransformStream({
            async transform(frame, controller) {
              frames++;
              if (frame.timestamp && frame.timestamp - startTime > 1000 * 10000) {
                console.log(`${new Date()}: FPS: ${frames}, tab active: ${document.hasFocus()}`);
                frames = 0;
                startTime = frame.timestamp;
              }
              controller.enqueue(frame);
            },
          }),
        )
        .pipeTo(sink);

      videoTrack.onended = () => console.log('track ended');
      videoTrack.onmute = () => console.log('track muted');

      registerOutputStreamTrack(generator);
    });
    */
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        console.log(`${new Date().toISOString()} - Initializing Teams SDK`);
        await app.initialize();
        alert('Teams SDK initialized');
        setIsInitialized(true);
        app.notifyAppLoaded();
        app.notifySuccess();
        videoExtensibilityTest();
      } catch (e) {
        console.log(`${new Date().toISOString()} - Faile to initializing Teams SDK`);
        alert('Initialization Error: App should be sideloaded onto a host' + e);
      }
    })();
  }, [setIsInitialized, setCurrTheme, videoExtensibilityTest]);

  return <FluentProvider theme={currTheme}>{!isInitialized && <Spinner />}</FluentProvider>;
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
