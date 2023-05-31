import "./Graph.css";
import { useGraphWithCredential } from "@microsoft/teamsfx-react";
import { Providers, ProviderState } from "@microsoft/mgt-element";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { Button } from "@fluentui/react-components";
import { Design } from "./Design";
import { PersonCardFluentUI } from "./PersonCardFluentUI";
import { PersonCardGraphToolkit } from "./PersonCardGraphToolkit";
import { useContext } from "react";
import { TeamsFxContext } from "../Context";

export function Graph() {
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const { loading, error, data, reload } = useGraphWithCredential(
    async (graph, teamsUserCredential, scope) => {
      // Call graph api directly to get user profile information
      const profile = await graph.api("/me").get();

      // Initialize Graph Toolkit TeamsFx provider
      const provider = new TeamsFxProvider(teamsUserCredential, scope);
      Providers.globalProvider = provider;
      Providers.globalProvider.setState(ProviderState.SignedIn);

      let photoUrl = "";
      try {
        const photo = await graph.api("/me/photo/$value").get();
        photoUrl = URL.createObjectURL(photo);
      } catch {
        // Could not fetch photo from user's profile, return empty string as placeholder.
      }
      return { profile, photoUrl };
    },
    { scope: ["User.Read"], credential: teamsUserCredential }
  );

  return (
    <div>
      <Design />
      <h3>Example: Get the user's profile</h3>
      <div className="section-margin">
        <p>Click below to authorize button to grant permission to using Microsoft Graph.</p>
        <pre>{`credential.login(scope);`}</pre>
        <Button appearance="primary" disabled={loading} onClick={reload}>
          Authorize
        </Button>

        <p>
          Below are two different implementations of retrieving profile photo for currently
          signed-in user using Fluent UI component and Graph Toolkit respectively.
        </p>
        <h4>1. Display user profile using Fluent UI Component</h4>
        <PersonCardFluentUI loading={loading} data={data} error={error} />
        <h4>2. Display user profile using Graph Toolkit</h4>
        <PersonCardGraphToolkit loading={loading} data={data} error={error} />
      </div>
    </div>
  );
}
