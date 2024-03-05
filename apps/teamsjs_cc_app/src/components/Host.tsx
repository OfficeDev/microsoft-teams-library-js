import "./App.css";

import * as Fluent from "@fluentui/react-northstar";

import { browserName, isMobile } from "react-device-detect";

import { app } from "@microsoft/teams-js";
import { useData } from "@microsoft/teamsfx-react";

export const Host = () => {
  const host = useData(async () => {
    await app.initialize();
    const context = await app.getContext();
    return { hostName: context.app.host.name, frameContext: context.page.frameContext };
  })?.data;
  return (
    <Fluent.Flex gap="gap.small" styles={{ justifyContent: "space-between" }}>
      <Fluent.Flex.Item>
        {host && (
          <Fluent.Text weight="bold">Current Host: {host.hostName}</Fluent.Text>
        )}
      </Fluent.Flex.Item>
      <Fluent.Flex.Item>
        <Fluent.Text weight="bold">Current Browser: {browserName}</Fluent.Text>
      </Fluent.Flex.Item>
      <Fluent.Flex.Item>
        <Fluent.Text weight="bold">Frame Context: {host?.frameContext}</Fluent.Text>
      </Fluent.Flex.Item>
      <Fluent.Flex.Item>
        <Fluent.Text weight="bold">
          {isMobile ? "Mobile device" : "Desktop device"}
        </Fluent.Text>
      </Fluent.Flex.Item>
    </Fluent.Flex>
  );
};
