import "./App.css";

import * as Fluent from "@fluentui/react-northstar";

import { browserName, isMobile } from 'react-device-detect';

import { app } from "@microsoft/teams-js";
import { useData } from "@microsoft/teamsfx-react";

export const Hub = () => {
    const hubName = useData(async () => {
        await app.initialize();
        const context = await app.getContext();
        return context.app.host.name;
    })?.data;
    return (
        <Fluent.Flex gap="gap.small" padding="padding.medium" styles={{ justifyContent: 'space-between' }}>
            <Fluent.Flex.Item>
                {hubName && (
                    <Fluent.Text weight="bold">Current Host: {hubName}</Fluent.Text>
                )}
            </Fluent.Flex.Item>
            <Fluent.Flex.Item>
                <Fluent.Text weight="bold">Current Browser: {browserName}</Fluent.Text>
            </Fluent.Flex.Item>

            <Fluent.Flex.Item>
                <Fluent.Text weight="bold">{isMobile ? 'Mobile device' : 'Desktop device'}</Fluent.Text>
            </Fluent.Flex.Item>
        </Fluent.Flex>
    );

}