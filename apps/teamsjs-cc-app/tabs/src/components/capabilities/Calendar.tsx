import { ProviderState, Providers } from "@microsoft/mgt-element";
import { app, calendar } from "@microsoft/teams-js";
import { booleanToString, convertRestIdToEwsId } from "../../helpers";

import { Button } from "@fluentui/react-northstar";
import { TeamsFxContext } from "../Context";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
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

      let calendars = await graph.api("/me/calendars").get();
      return { calendars };
    },
    {
      scope: ["User.Read", "Calendars.ReadBasic"],
      credential: teamsUserCredential,
    }
  );

  // check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (calendar.isSupported()) {
      return (
        <>
          <Button
            onClick={async () => {
              await calendar.composeMeeting({
                attendees: [
                  "AdeleV@6plbfs.onmicrosoft.com",
                  "AlexW@6plbfs.onmicrosoft.com",
                ],
                content: "Meeting Agenda",
                subject: "Meeting created by TeamsJS",
              });
            }}
          >
            Compose Meeting
          </Button>
          <Button
            primary
            content="Authorize"
            disabled={data?.calendars ? false : true}
            onClick={reload}
          />
          <Button
            disabled={data?.calendars === undefined ? true : false}
            onClick={async () => {
              if (
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
          </Button>
        </>
      );
    } else {
      // return's  if capability is not supported.
      return <>Capability is not supported</>;
    }
  }
  // return's  if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const CalendarIsSupported = () =>
  booleanToString(calendar.isSupported());
