import "./App.css";

import * as Fluent from "@fluentui/react-northstar";

import { browserName, isMobile } from "react-device-detect";

import { app } from "@microsoft/teams-js";
import { useData } from "@microsoft/teamsfx-react";

export const Host = () => {
  const hostName = useData(async () => {
    await app.initialize();
    const context = await app.getContext();
    return context.app.host.name;
  })?.data;
  return (
    <Fluent.Flex gap="gap.small" styles={{ justifyContent: "space-between" }}>
      <Fluent.Flex.Item>
        {hostName && (
          <Fluent.Text weight="bold">Current Host: {hostName}</Fluent.Text>
        )}
      </Fluent.Flex.Item>
      <Fluent.Flex.Item>
        <Fluent.Text weight="bold">Current Browser: {browserName}</Fluent.Text>
      </Fluent.Flex.Item>

      <Fluent.Flex.Item>
        <Fluent.Text weight="bold">
          {isMobile ? "Mobile device" : "Desktop device"}
        </Fluent.Text>
      </Fluent.Flex.Item>
    </Fluent.Flex>
  );
};
