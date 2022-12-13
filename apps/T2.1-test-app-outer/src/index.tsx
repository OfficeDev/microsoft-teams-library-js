import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const postStartMsg = async () => {
  console.log('postStartMsg');
  postMessage(
    {
      func: 'video.startVideoExtensibilityVideoStream',
      args: [{ streamId: 'webview2-abcd1234' }],
    },
    '*',
  );

  // console.log('create video');
  // const video = document.createElement('video');
  // video.width = 480;
  // video.height = 360;
  // document.body.appendChild(video);
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const chrome = window['chrome'] as any;
  // const mediaStream = await chrome.webview.getTextureStream('webview2-abcd1234');
  // video.srcObject = mediaStream;
  // video.play();
};

const iframe = document.getElementById('app') as HTMLIFrameElement;

const sendToIframe = (msg: unknown): void => {
  // dose not work??
  if (iframe) {
    //console.log('sendToIframe', msg);
    iframe?.contentWindow?.postMessage(msg, '*');
  }
};

ReactDOM.render(
  <React.StrictMode>
    <button onClick={postStartMsg}>postStartMsg</button>
  </React.StrictMode>,
  document.getElementById('root'),
);

window.addEventListener('message', (event) => {
  //console.log('on app message: ', event);
  if (event.data.func === 'initialize') {
    sendToIframe({
      id: event.data.id,
      args: ['sidePanel'],
    });
  } else {
    sendToIframe(event.data);
  }
});
window.addEventListener('ipc-message', () => {
  console.log('on app ipc-message');
});
