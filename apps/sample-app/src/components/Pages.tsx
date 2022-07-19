import { Button } from '@fluentui/react-components';
import { pages, ShareDeepLinkParameters } from '@microsoft/teams-js';
import React from 'react';

const handlePages = async (): Promise<void> => {
  const input: pages.NavigateToAppParams = {
    appId: 'addAppIDHere',
    pageId: 'addPageIDHere',
  };
  await pages.navigateToApp(input);
};
const ShareDeepLinkPage = async (): Promise<void> => {
  const deepLinkInput: ShareDeepLinkParameters = {
    subPageId: 'subentityId',
    subPageLabel: 'subentitylabel',
    subPageWebUrl: 'subentityURL',
  };
  await pages.shareDeepLink(deepLinkInput);
};
export const PagesCapability: React.FunctionComponent = () => {
  return (
    <div>
      <Button onClick={() => handlePages()}> Deeplink page </Button>
      <Button onClick={() => ShareDeepLinkPage()}> Share Deep Link Page </Button>
    </div>
  );
};
