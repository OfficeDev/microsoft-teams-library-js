import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { monetization } from "@microsoft/teams-js";

/**
 * This component is for monetizing purpose
 */
export const Monetization = () => {
    // check to see if capability is supported
    if (monetization.isSupported()) {
        return (
            <>
                <Button onClick={async () => {
                    await monetization.openPurchaseExperience({
                        planId: '',
                        term: ''
                    });
                }}>
                    Monetization OpenPurchaseExperience
                </Button>
            </>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const MonetizationIsSupported = () => booleanToString(monetization.isSupported());
