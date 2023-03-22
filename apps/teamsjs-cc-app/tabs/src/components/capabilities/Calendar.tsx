import { calendar, people } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * This component returns button to compose a meeting
 */
export const Calendar = () => {
    // check to see if capability is supported
    if (calendar.isSupported()) {
        return (
            <Button onClick={async () => {
                const picked = await people.selectPeople();
                await calendar.composeMeeting({
                    attendees: [
                        'AdeleV@6plbfs.onmicrosoft.com',
                        'AlexW@6plbfs.onmicrosoft.com'
                    ],
                    content: "Meeting Agenda",
                    subject: "Meeting created by Teams JS"
                })
            }}>
                Compose Meeting
            </Button>
        )
    };
    // return empty fragment if capability is not supported
    return (<></>);
}

export const CalendarIsSupported = () => booleanToString(calendar.isSupported());
