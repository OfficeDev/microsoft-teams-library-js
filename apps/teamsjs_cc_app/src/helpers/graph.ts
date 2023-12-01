import { ProviderState, Providers } from "@microsoft/mgt-element";

import { TeamsFxContext } from "../components/Context";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { useContext } from "react";
import { useGraphWithCredential } from "@microsoft/teamsfx-react";

export function MailGraph() {
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
  return { loading, error, data, reload };
}

export function CalendersGraph() {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const { loading, error, data, reload } = useGraphWithCredential(
    async (graph, teamsUserCredential, scope) => {
      // Initialize Graph Toolkit TeamsFx provider
      const provider = new TeamsFxProvider(teamsUserCredential, scope);
      Providers.globalProvider = provider;
      Providers.globalProvider.setState(ProviderState.SignedIn);

      let calenders = await graph.api("/me/calenders").get();
      return { calenders };
    },
    {
      scope: ["User.Read", "Calendars.ReadBasic"],
      credential: teamsUserCredential,
    }
  );
  return { loading, error, data, reload };
}
