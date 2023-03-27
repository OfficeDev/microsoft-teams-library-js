import { Button, Flex } from "@fluentui/react-northstar";

import { booleanToString } from "../../helpers";
import { pages } from "@microsoft/teams-js";

/**
 * This component returns a button which navigates to particular tab
 * with pageId or to a default page.
 */
export const PagesCurrent = () => {
    // check to see if capability is supported
    if (pages.isSupported()) {

        if (pages.currentApp.isSupported()) {
            return (
                <Flex gap="gap.small" vAlign="center">
                    <Button onClick={async () => {
                        await pages.currentApp.navigateTo({
                            pageId: 'pagesTab'
                        })
                    }}>
                        Navigate Current App (PagesTab)
                    </Button>
                    <Button onClick={async () => {
                        await pages.currentApp.navigateToDefaultPage();
                    }}>
                        Navigate To Default Page
                    </Button>
                </Flex>
            );
        }
    }
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const IsPagesCurrentAppSupported = () => booleanToString(pages.currentApp.isSupported());
