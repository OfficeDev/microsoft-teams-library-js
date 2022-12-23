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

    video.registerForVideoFrameV2(
      (receivedFrame) => {
        const frame = receivedFrame.frame;
        //console.log('receivedFrame', frame.timestamp, frame.codedHeight, frame.codedWidth, frame.allocationSize());
        return Promise.resolve(simpleHalfEffect(frame));
      },
      { format: video.VideoFrameFormat.NV12 },
    );
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
