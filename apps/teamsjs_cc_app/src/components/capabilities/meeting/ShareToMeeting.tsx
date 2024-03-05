import React, { useEffect } from "react";

// Default browser page from where content can directly shared to meeting.
const ShareToMeeting = (props: any) => {

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://teams.microsoft.com/share/launcher.js";
        document.body.appendChild(script);
    }, []);

    return (
        <>
            <div className="surface">
                <h3 id="tabheader"> Welcome Meeting Tab</h3>
            </div>
        </>
    );
};

export default ShareToMeeting;