import { booleanToString } from "../../helpers";
import { monetization } from "@microsoft/teams-js";

/**
 * This component is comming soon
 */
export const Monetization = () => {
    // check to see if capability is supported
    if (monetization.isSupported()) {
        return (
            <div>Coming soon</div>
        )
    };
    // return empty fragment if capability is not supported
    return (<></>);
}

export const MonetizationIsSupported = () => booleanToString(monetization.isSupported());
