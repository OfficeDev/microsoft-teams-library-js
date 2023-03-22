import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

import React from "react";

interface INavBackState {
    element: JSX.Element;
}

export default class NavigateBack extends React.PureComponent<{}, INavBackState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            element: <></>
        }
    }
    public async componentDidMount() {
        await app.initialize();
        if (app.isInitialized()) {
            // register back button event handler
            pages.backStack.registerBackButtonHandler(() => {
                console.log("Back button pressed");
                return true;
            });
            this.setState({
                element: <Fluent.Segment className="ui-pagessegment">
                    <Fluent.Header content="Navigate Back" as="h2" />
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        <Fluent.Text className="ui-pagestext" content="Navigates back in the hosted application." />
                    </Fluent.Flex>
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        {/* // check to see if capability is supported */}
                        {pages.backStack.isSupported() &&
                            <Fluent.Button onClick={async () => {
                                await pages.backStack.navigateBack();
                            }}>
                                Click me to Navigate Back
                            </Fluent.Button>
                        }
                    </Fluent.Flex>
                </Fluent.Segment>
            })
        }
    }
    render() {

        return (<>{this.state.element}</>);
    }
}