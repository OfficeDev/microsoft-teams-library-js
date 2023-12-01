import { Button, Dropdown, Flex, Tooltip } from "@fluentui/react-northstar";
import {
  CapabilityStatus,
  adobeAcrobat,
  developersPortal,
  powerBI,
  vivaEngage,
  vivaInsight,
} from "../../helpers/constants";
import { app, stageView } from "@microsoft/teams-js";

import { isMobile } from "react-device-detect";
import { useState } from "react";

interface IDropDrownProps {
  content: string;
  header: string;
}

/**
 * This component open Developer Portal app in stage view
 */
export const StageView = () => {
  const [appId, setAppId] = useState({} as IDropDrownProps);
  const appIds: IDropDrownProps[] = [{
    content: developersPortal.appId,
    header: developersPortal.name
  }, {
    content: powerBI.appId,
    header: powerBI.name
  }, {
    content: vivaInsight.appId,
    header: vivaInsight.name
  },
  {
    content: vivaEngage.appId,
    header: vivaEngage.name
  }, {
    content: adobeAcrobat.appId,
    header: adobeAcrobat.name
  }];
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (stageView.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Dropdown
            items={appIds}
            placeholder="Select any app"
            getA11ySelectionMessage={{
              onAdd: (item: any) => {
                setAppId(item);
                return "";
              }
            }}
          />
          <Tooltip content="stageView.open()" trigger={
            <Button className="btn_stageview"
              onClick={async () => {
                // open Developer Portal app in stage view
                try {
                  await stageView.open({
                    appId: appId.content,
                    contentUrl: "https://dev.teams.microsoft.com/home?host=teams",
                    websiteUrl: "https://dev.teams.microsoft.com/home?host=teams",
                    threadId: "",
                    title: appId.header,
                  });
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              Open Stage View (only set up for Developer Portal)
            </Button>
          } />
        </Flex >
      );
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
