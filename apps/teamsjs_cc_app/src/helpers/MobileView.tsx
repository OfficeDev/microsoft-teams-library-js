import * as Fluent from "@fluentui/react-northstar";

export const MobileView = (tableRows: Fluent.ShorthandCollection<Fluent.TableRowProps, Record<string, {}>>, showSupportedOnly: boolean) => {
    const elements = tableRows.map((row: any) => {
        return (<>
            {row && <Fluent.Segment className="ui-pagessegment" key={row.key}>
                <Fluent.Flex>
                    <Fluent.Flex.Item>
                        <Fluent.Header className="ui-header_mobile" content={'Capability'} as="h4" />
                    </Fluent.Flex.Item>
                    <div className="ui_content_mobile">
                        {row.items[0].content}
                    </div>
                </Fluent.Flex>
                <Fluent.Flex>
                    <Fluent.Flex.Item>
                        <Fluent.Header className="ui-header_mobile" content={'Supported'} as="h4" />
                    </Fluent.Flex.Item>
                    <div className="ui_content_mobile">
                        {row.items[1].content}
                    </div>
                </Fluent.Flex>
                <Fluent.Flex>
                    <Fluent.Header className="ui-header_mobile" content={'Actions'} as="h4" />
                    {row.items[2].content}
                </Fluent.Flex>
            </Fluent.Segment>}
        </>);

    });
    return <>{elements}</>;
}