import { Button, Flex, TextArea } from "@fluentui/react-northstar";
import { app, pages } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";
import { useState } from "react";

/**
 * Provides APIs for querying and navigating between contextual tabs of an application.
 * Unlike personal tabs, contextual tabs are pages associated with a specific context, such as channel or chat.
 */
export const PagesTabs = () => {
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
  // check to see if capability is supported
  // see TabConfig.tsx for more details on pages.config namespace usage

  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    if (!pages.tabs.isSupported()) {
      // return's  if capability is not supported.
      return <>Capability is not supported</>;
    }
    return (
      <Flex gap="gap.small" vAlign="center">
        {pages.tabs.isSupported() && (
          <>
            <Button
              onClick={async () => {
                const config = await pages.tabs.getTabInstances();
                console.log(config);
                setText(`Get tab instances: ${JSON.stringify(config)}`);
                setShowText(true);
              }}
            >
              Get tab instances
            </Button>
            <Button
              onClick={async () => {
                const config = await pages.tabs.getMruTabInstances();
                console.log(config);
                setText(
                  `Most Recently Used tab instances: ${JSON.stringify(config)}`
                );
                setShowText(true);
              }}
            >
              Get Most Recently Used tab instances
            </Button>
            <Button
              onClick={async () => {
                // only works for channel tabs, see
                // https://stackoverflow.com/questions/62390440/msteams-development-navigate-between-personal-tabs
                const baseUrl = `https://${window.location.host}`;
                // deprecated? check docs
                await pages.tabs.navigateToTab({
                  tabName: "Terms of use",
                  entityId: "tou1",
                  url: `${baseUrl}/index.html#/termsofuse`,
                  websiteUrl: `${baseUrl}/index.html#/termsofuse`,
                });
              }}
            >
              Navigate to tab
            </Button>
            {showText && <TextArea className="ui_location" value={text} />}
          </>
        )}
      </Flex>
    );
  }
  // return's if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const PagesTabsIsSupported = () =>
  booleanToString(pages.tabs.isSupported());
