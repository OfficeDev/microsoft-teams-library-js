import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { ProviderState, Providers } from "@microsoft/mgt-element";
import { app, calendar } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { TeamsFxContext } from "../Context";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { convertRestIdToEwsId } from "../../helpers/utils";
import { isMobile } from "react-device-detect";
import { useContext } from "react";
import { useGraphWithCredential } from "@microsoft/teamsfx-react";

/**
 * This component returns button to compose a meeting
 */
export const Calendar = () => {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const { loading, error, data, reload } = useGraphWithCredential(
    async (graph, teamsUserCredential, scope) => {
      // Initialize Graph Toolkit TeamsFx provider
      const provider = new TeamsFxProvider(teamsUserCredential, scope);
      Providers.globalProvider = provider;
      Providers.globalProvider.setState(ProviderState.SignedIn);

      let calendars = await graph.api("/me/events?$select=subject").get();
      return { calendars };
    },
    {
      scope: ["User.Read", "Calendars.Read"],
      credential: teamsUserCredential,
    }
  );

  // check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (calendar.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          {!loading && !data &&
            <Button onClick={reload} disabled={loading}>Authorize</Button>
          }
          <Tooltip content="API: calendar.composeMeeting() FrameContexts: content" trigger={
            <Button
              onClick={async () => {
                const ctx = await app.getContext();
                const domain = ctx.user && ctx.user.loginHint?.split('@').at(1);
                await calendar.composeMeeting({
                  attendees: [
                    `AdeleV@${domain}`,
                    `AlexW@${domain}`,
                  ],
                  content: "Meeting Agenda",
                  subject: "Meeting created by TeamsJS",
                });
              }}
            >
              Compose Meeting
            </Button>
          } />
          <Tooltip content="API: calendar.openCalendarItem() FrameContexts: content" trigger={
            <Button disabled={loading} onClick={async () => {
              if (!loading &&
                data &&
                data.calendars.value.length > 0 &&
                data.calendars.value[0].id
              ) {
                await calendar.openCalendarItem({
                  // Item id for calendar item can be retrieved using the graph api,
                  // the following line converts the retrieved EWS id to Rest id
                  itemId: convertRestIdToEwsId(data.calendars.value[0].id),
                });
              } else {
                console.log("Please check if you are authenticated", error);
              }
            }}
            >
              Open Calendar Item
            </Button >
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};

