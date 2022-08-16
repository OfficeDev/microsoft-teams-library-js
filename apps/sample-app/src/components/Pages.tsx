import { Button } from '@fluentui/react-components';
import { pages, ShareDeepLinkParameters } from '@microsoft/teams-js';
import React from 'react';

const handlePages = async (): Promise<void> => {
  const input: pages.NavigateToAppParams = {
    // App ID below is for the Monday App
    appId: 'eab2d3ce-6d6a-4415-abc4-5f40a8317b1f',
    pageId: 'addPageIDHere',
  };
  await pages.navigateToApp(input);
};
const ShareDeepLinkPage = async (): Promise<void> => {
  // placeholder pages below
  const deepLinkInput: ShareDeepLinkParameters = {
    subPageId: 'subentityId',
    subPageLabel: 'subentitylabel',
    subPageWebUrl: 'subentityURL',
  };
  await pages.shareDeepLink(deepLinkInput);
};
export const PagesCapability: React.FunctionComponent = () => {
  return (
    <div className="flex-container" id="Pages API">
      <div className="column" aria-labelledby="Pages API">
        <Button onClick={() => handlePages()}> Monday App </Button>
      </div>
      <div className="column" aria-labelledby="Pages API">
        <Button onClick={() => ShareDeepLinkPage()}> Share Deep Link Page </Button>
      </div>
    </div>
  );
};
