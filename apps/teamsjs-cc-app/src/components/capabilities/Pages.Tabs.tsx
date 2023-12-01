import { Button, Flex, TextArea, Tooltip } from "@fluentui/react-northstar";
import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";
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
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
    return (
      <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
        {pages.tabs.isSupported() && (
          <>
            <Tooltip content="pages.tabs.getTabInstances()" trigger={
              <Button
                onClick={async () => {
                  const config = await pages.tabs.getTabInstances();
                  console.log(config);
                  setText(`Get tab instances: ${JSON.stringify(config, null, 2)}`);
                  setShowText(true);
                }}
              >
                Get tab instances
              </Button>
            } />
            <Tooltip content="pages.tabs.getMruTabInstances()" trigger={
              <Button
                onClick={async () => {
                  const config = await pages.tabs.getMruTabInstances();
                  console.log(config);
                  setText(
                    `Most Recently Used tab instances: ${JSON.stringify(config, null, 2)}`
                  );
                  setShowText(true);
                }}
              >
                Get Most Recently Used tab instances
              </Button>
            } />
            <Tooltip content="pages.tabs.navigateToTab()" trigger={
              <Button
                onClick={async () => {

                  const config = await pages.tabs.getMruTabInstances();
                  const teamTabs = config.teamTabs[0];
                  // only works for channel tabs, see
                  // https://stackoverflow.com/questions/62390440/msteams-development-navigate-between-personal-tabs
                  // const baseUrl = `https://${window.location.host}`;
                  // deprecated? check docs
                  await pages.tabs.navigateToTab(teamTabs);
                }}
              >
                Navigate to tab
              </Button>
            } />
            {showText && <TextArea className="ui_location" value={text} />}
          </>
        )}
      </Flex>
    );
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
