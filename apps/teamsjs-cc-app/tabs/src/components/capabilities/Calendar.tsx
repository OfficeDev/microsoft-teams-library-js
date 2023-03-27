import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { calendar } from "@microsoft/teams-js";

/**
 * This component returns button to compose a meeting
 */
export const Calendar = () => {
    // check to see if capability is supported
    if (calendar.isSupported()) {
        return (
            <>
                <Button onClick={async () => {
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
                <Button onClick={async () => {
                    await calendar.openCalendarItem({ itemId: "" })
                }}>
                    Open Calendar Item
                </Button>
            </>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const CalendarIsSupported = () => booleanToString(calendar.isSupported());
