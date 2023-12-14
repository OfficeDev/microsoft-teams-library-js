/* eslint-disable @typescript-eslint/ban-types */
import { embeddedApp } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const EmbeddedAppAPIs = (): ReactElement => {
  const CheckEmbeddedAppCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkEmbeddedApp',
      title: 'Check Embedded App',
      onClick: async () => {
        if (embeddedApp.isSupported()) {
          return 'Embedded apps are supported';
        } else {
          return 'Embedded apps are not supported';
        }
      },
    });

  const InsertBlankIframeIntoDom = (): ReactElement =>
    ApiWithoutInput({
      name: 'insertBlankIframe',
      title: 'Insert Blank Iframe',
      onClick: async () => {
        const iframe = document.createElement('iframe');
        iframe.id = 'embeddedApp1';
        document.body.prepend(iframe);
        return 'iframe inserted into DOM successfully';
      },
    });

  const EmbeddedAppStart = (): ReactElement =>
    ApiWithoutInput({
      name: 'embeddedAppStart',
      title: 'Embedded App Start',
      onClick: async () => {
        await embeddedApp.start('11111111-1111-1111-1111-111111111111', 'https://fakeembeddedapp.com');
        return 'embedded app started successfully';
      },
    });

  const EmbeddedAppStop = (): ReactElement =>
    ApiWithoutInput({
      name: 'embeddedAppStop',
      title: 'Embedded App Stop',
      onClick: async () => {
        await embeddedApp.stop();
        return 'embedded app stopped successfully';
      },
    });

  return (
    <ModuleWrapper title="EmbeddedApp">
      <CheckEmbeddedAppCapability />
      <InsertBlankIframeIntoDom />
      <EmbeddedAppStart />
      <EmbeddedAppStop />
    </ModuleWrapper>
  );
};

export default EmbeddedAppAPIs;
