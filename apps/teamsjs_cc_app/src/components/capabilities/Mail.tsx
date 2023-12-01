import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { ProviderState, Providers } from "@microsoft/mgt-element";
import { app, mail } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { TeamsFxContext } from "../Context";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { convertRestIdToEwsId } from "../../helpers/utils";
import { isMobile } from "react-device-detect";
import { useContext } from "react";
import { useGraphWithCredential } from "@microsoft/teamsfx-react";

/**
 * This component compose a new mail and open's an existing mail with mailItemId
 */
export const Mail = () => {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const { loading, error, data, reload } = useGraphWithCredential(
    async (graph, teamsUserCredential, scope) => {
      // Initialize Graph Toolkit TeamsFx provider
      const provider = new TeamsFxProvider(teamsUserCredential, scope);
      Providers.globalProvider = provider;
      Providers.globalProvider.setState(ProviderState.SignedIn);

      let mail = await graph.api("/me/messages").get();
      return { mail };
    },
    { scope: ["User.Read", "Mail.Read"], credential: teamsUserCredential }
  );
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (mail.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="mail.composeMail()" trigger={
            <Button
              onClick={async () => {
                await mail.composeMail({
                  type: mail.ComposeMailType.New,
                  subject: "Here goes the mail subject ",
                  message: "This is the first mail you are about to send",
                  toRecipients: [
                    "AdeleV@6plbfs.onmicrosoft.com",
                    "AlexW@6plbfs.onmicrosoft.com",
                  ],
                });
              }}
            >
              Compose Mail
            </Button>
          } />
          {!loading && !data &&
            <Button onClick={reload} disabled={loading}>Authorize</Button>
          }
          <Tooltip content="mail.openMailItem()" trigger={
            <Button disabled={loading} onClick={async () => {
              if (!loading && data && data.mail.value.length > 0 && data.mail.value[0].id) {
                // Item id for mail item can be retrieved using grapgh api,
                // and convert retrieved EWS id to Rest id.
                await mail.openMailItem({
                  itemId: convertRestIdToEwsId(data.mail.value[0].id),
                });
              } else {
                console.log("Please check if you are authenticated", error);
              }
            }}
            >
              Open Mail Item
            </Button>
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
