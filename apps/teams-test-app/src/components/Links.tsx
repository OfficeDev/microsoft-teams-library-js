import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';

const MoveToLink = (): ReactElement =>
  ApiWithTextInput<string>({
    name: 'moveToLink',
    title: 'Move to Link',
    onClick: {
      validateInput: input => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: async input => {
        window.location.href = input;
        return Promise.resolve('Moved to new link');
      },
    },
  });

const OpenLinkInNewWindow = (): ReactElement =>
  ApiWithTextInput<string>({
    name: 'openLinkInNewWindow',
    title: 'Open link in new window',
    onClick: {
      validateInput: input => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: async input => {
        window.open(input);
        return Promise.resolve('Link opened');
      },
    },
  });

const Links = (): ReactElement => (
  <>
    <h1>Links</h1>
    <a id="link_simple" href="https://teams-test-tab.azurewebsites.net/">
      Simple Link
    </a>
    <br />
    <a id="link_target_blank" rel="noreferrer" href="https://teams-test-tab.azurewebsites.net/" target="_blank">
      Target Blank
    </a>
    <br />
    <a rel="noreferrer" href="https://teams-test-tab.azurewebsites.net/" target="_self">
      Target Self
    </a>
    <br />
    <a rel="noreferrer" href="https://teams-test-tab.azurewebsites.net/" target="_parent">
      Target Parent
    </a>
    <br />
    <a rel="noreferrer" href="https://teams-test-tab.azurewebsites.net/" target="_top">
      Target Top
    </a>
    <br />
    <a rel="noreferrer" href="https://www.bing.com/" target="_blank">
      Target Blank Bing
    </a>
    <br />
    <MoveToLink />
    <OpenLinkInNewWindow />
  </>
);

export default Links;
