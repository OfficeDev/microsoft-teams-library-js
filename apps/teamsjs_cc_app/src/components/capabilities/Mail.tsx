import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { ProviderState, Providers } from "@microsoft/mgt-element";
import { app, mail } from "@microsoft/teams-js";
import { useContext, useState } from "react";

import { CapabilityStatus } from "../../helpers/constants";
import { TeamsFxContext } from "../Context";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { convertRestIdToEwsId } from "../../helpers/utils";
import { isMobile } from "react-device-detect";
import { useGraphWithCredential } from "@microsoft/teamsfx-react";

/**
 * This component compose a new mail and open's an existing mail with mailItemId
 */
export const Mail = () => {
  const [context, setContext] = useState({} as app.Context);
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

  app.getContext().then(ctx => {
    setContext(ctx);
  })
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (mail.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          {!loading && !data &&
            <Button onClick={reload} disabled={loading}>Authorize</Button>
          }
          <Tooltip content="API: mail.composeMail() FrameContexts: content" trigger={
            <Button
              onClick={async () => {
                const loginDomain = context.user?.userPrincipalName?.split('@').at(1);
                await mail.composeMail({
                  type: mail.ComposeMailType.New,
                  subject: "Here goes the mail subject ",
                  message: "This is the first mail you are about to send",
                  toRecipients: [
                    `AdeleV@${loginDomain}`,
                    `AlexW@${loginDomain}`,
                  ],
                });
              }}
            >
              Compose Mail
            </Button>
          } />
          <Tooltip content="API: mail.openMailItem() FrameContexts: content" trigger={
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
