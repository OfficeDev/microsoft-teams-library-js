import { useContext, useState } from "react";
import {
  Image,
  TabList,
  Tab,
  SelectTabEvent,
  SelectTabData,
  TabValue,
} from "@fluentui/react-components";
import "./Welcome.css";
import { Scenario1 } from "./Scenario1";
import { useData } from "@microsoft/teamsfx-react";
import { TeamsJs } from "./TeamsJs";
import { WebHub } from "./WebHub";
import { TeamsFxContext } from "../Context";
import { app } from "@microsoft/teams-js";

export function Welcome(props: { showFunction?: boolean; environment?: string }) {
  const { showFunction, environment } = {
    showFunction: true,
    environment: window.location.hostname === "localhost" ? "local" : "azure",
    ...props,
  };
  const friendlyEnvironmentName =
    {
      local: "local environment",
      azure: "Azure environment",
    }[environment] || "local environment";

  const [selectedValue, setSelectedValue] = useState<TabValue>("local");

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };
  const { teamsUserCredential } = useContext(TeamsFxContext);
  const { loading, data, error } = useData(async () => {
    if (teamsUserCredential) {
      const userInfo = await teamsUserCredential.getUserInfo();
      return userInfo;
    }
  });
  const userName = loading || error ? "" : data!.displayName;
  const hubName = useData(async () => {
    await app.initialize();
    const context = await app.getContext();
    return context.app.host.name;
  })?.data;
  return (
    <div className="welcome page">
      <div className="narrow page-padding">
        <Image src="hello.png" />
        <h1 className="center">Congratulations{userName ? ", " + userName : ""}!</h1>
        {hubName && <p className="center">The diagnostic app is running in {hubName}</p>}
        <p className="center">The diagnostic app is running in your {friendlyEnvironmentName}</p>

        <div className="tabList">
          <TabList selectedValue={selectedValue} onTabSelect={onTabSelect}>
            <Tab id="Local" value="local">
              MetaOS API Logging
            </Tab>
            <Tab id="Azure" value="azure">
              TeamsJS Logging
            </Tab>
            <Tab id="Web Hub" value="webHub">
              Web Hub SDK Logging
            </Tab>
          </TabList>
          <div>
            {selectedValue === "local" && (
              <div>
                <Scenario1 showFunction={showFunction} />
        
              </div>
            )}
            {selectedValue === "azure" && (
              <div>
                <TeamsJs />
              </div>
            )}
            {selectedValue === "webHub" && (
              <div>
                <WebHub />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
