import { Button, Dropdown, DropdownItemProps, Flex, Tooltip } from "@fluentui/react-northstar";
import { CapabilityStatus, adobeAcrobat, developersPortal, powerBI, vivaEngage, vivaInsight } from "../../helpers/constants";
import { app, appInstallDialog } from "@microsoft/teams-js";

import { isMobile } from "react-device-detect";
import { useState } from "react";
import { validateGuid } from "../../helpers/utils";

/**
 * This component Open's a dialog with particular application to install.
 */
export const AppInstallDialog = () => {
  const [appId, setAppId] = useState("");

  const appIds: DropdownItemProps[] = [{
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

  // Check if app is initialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (appInstallDialog.isSupported()) {
      // return button to open dialog
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Dropdown
            search
            items={appIds}
            placeholder="Enter app Id or select"
            onSelect={(e: any) => {
              const value = e.target.value ? e.target.value : "";
              if (validateGuid(value)) {
                setAppId(value);
              } else {
                const appId = appIds.find(x => { return x.header === value })
                setAppId(appId && appId.content ? appId.content.toString() : '');
              }
            }}
          />
          <Tooltip trigger={
            <Button
              onClick={async () => {
                // open the install dialog for the Developer Portal app
                await appInstallDialog.openAppInstallDialog({
                  appId: appId,
                });
              }}
            >
              Open App Install Dialog
            </Button>} content="appInstallDialog.openAppInstallDialog()" />
        </Flex>
      );
    } else {
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  return <>{CapabilityStatus.NotInitialized}</>;
};
