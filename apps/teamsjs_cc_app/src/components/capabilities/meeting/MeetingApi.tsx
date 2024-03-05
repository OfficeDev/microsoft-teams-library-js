import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, meeting } from "@microsoft/teams-js";

import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component returns 
 */
export const MeetingApi = () => {
    const [result, setResult] = useState("");

    const getIncomingClientAudioState = () => {
        app.initialize().then(() => {
            app.notifySuccess();
            meeting.getIncomingClientAudioState((errcode, bln) => {
                if (errcode) {
                    console.log(JSON.stringify(errcode));
                }
                else {
                    setResult(JSON.stringify(bln));
                    console.log(result);
                }
            });
        });
    }
    /// <summary>
    /// This method toggleIncomingClientAudio which toggles mute/unmute to client audio.
    /// Setting for the meeting user from mute to unmute or vice-versa.
    /// </summary>
    const toggleState = () => {
        app.initialize().then(response => {
            app.notifySuccess();
            meeting.toggleIncomingClientAudio((errcode, bln) => {
                if (errcode) {
                    console.log(JSON.stringify(errcode));
                }
                else {
                    //setResult(JSON.stringify(bln));
                }
            });
        });
    }
    const shareSpecificPart = () => {
        var appContentUrl = "";
        app.getContext().then((context: app.Context) => {
            appContentUrl = `${window.location.origin}/index.html#/shareview?meetingId=${context.meeting!.id}`;
            meeting.shareAppContentToStage((err, result) => {
                if (result) {
                    // handle success
                    console.log("Shared successfully!");
                }

                if (err) {
                    // handle error
                    alert(+JSON.stringify(err))
                }
            }, appContentUrl);
        });
    };

    const getAppContentStageSharingCapabilities = () => {
        meeting.getAppContentStageSharingCapabilities((response) => {
            alert(response);
            if (response?.errorCode) {

            }
            if (response?.message) {

            }
        })
    }

    const getAppContentStageSharingState = () => {
        meeting.getAppContentStageSharingState((response) => {
            alert(response);
            if (response?.errorCode) {

            }
            if (response?.message) {

            }
        })
    }

    const getLiveStreamState = () => {
        meeting.getLiveStreamState((response) => {
            alert(JSON.stringify(response));
        })
    }

    const getMeetingDetails = () => {
        meeting.getMeetingDetails(callback => {
            alert(JSON.stringify(callback));
        })
    }

    const registerLiveStreamChangedHandler = () => {
        meeting.registerLiveStreamChangedHandler(handler => {
            alert(JSON.stringify(handler));
        })
    }

    const registerMeetingReactionReceivedHandler = () => {
        meeting.registerMeetingReactionReceivedHandler(handler => {
            alert(JSON.stringify(handler));
        });
    }

    const registerRaiseHandStateChangedHandler = () => {
        meeting.registerRaiseHandStateChangedHandler(handler => {
            alert(JSON.stringify(handler));
        });
    }

    const registerSpeakingStateChangeHandler = () => {
        meeting.registerSpeakingStateChangeHandler(handler => {
            alert(JSON.stringify(handler));
        });
    }
    const stopSharingAppContentToStage = () => {
        meeting.stopSharingAppContentToStage(handler => {
            alert(JSON.stringify(handler));
        });
    }

    const updateMicState = () => {
        let result: boolean = false;
        meeting.getIncomingClientAudioState((errcode, bln) => {
            if (errcode) {
                alert(JSON.stringify(errcode));
            }
            else {
                result = bln ? bln : false;
                setResult(JSON.stringify(bln));
                alert(result);
            }
        });
        meeting.updateMicState({ isMicMuted: result });
        alert(result)
    }

    return (
        <div style={{ paddingLeft: "10px" }}>
            <Flex style={{ flexDirection: "column", fontSize: "10px" }} gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} >
                <div className="tag-container">
                    <h3>Share To Stage View</h3>
                    <Tooltip content="meeting.shareAppContentToStage()" trigger={<Button onClick={shareSpecificPart} >Share</Button>} />
                </div>
                <div className="tag-container">
                    <h3>Get Incoming Client Audio State</h3>
                    <Tooltip content="meeting.getIncomingClientAudioState()" trigger={<Button onClick={getIncomingClientAudioState} >GetIncomingClientAudioState</Button>} />
                    <p>State: {result}</p>
                </div>
                <div className="tag-container">
                    <h3>Mute/Unmute Audio Call </h3>
                    <Tooltip content="meeting.toggleIncomingClientAudio()" trigger={<Button onClick={toggleState} >Mute/Un-Mute</Button>} />
                </div>
                <div className="tag-container">
                    <h3>Get App Content Stage Sharing State </h3>
                    <Tooltip content="meeting.getAppContentStageSharingState()" trigger={<Button onClick={getAppContentStageSharingState} >GetAppContentStageSharingState</Button>} />
                </div>
                <div className="tag-container">
                    <h3>Get App Content Stage Sharing Capabilities</h3>
                    <Tooltip content="meeting.getAppContentStageSharingCapabilities()" trigger={<Button onClick={getAppContentStageSharingCapabilities} >GetAppContentStageSharingCapabilities</Button>} />
                </div>
                <div className="tag-container">
                    <h3>Get Live Stream State</h3>
                    <Tooltip content="meeting.getLiveStreamState()" trigger={<Button onClick={getLiveStreamState} >GetLiveStreamState</Button>} />
                </div>
                <div className="tag-container">
                    <h3>Get Meeting Details</h3>
                    <Tooltip content="meeting.getMeetingDetails()" trigger={<Button onClick={getMeetingDetails} >GetMeetingDetails</Button>} />
                </div>
                <div className="tag-container">
                    <h3>RegisterLiveStreamChangedHandler</h3>
                    <Tooltip content="meeting.registerLiveStreamChangedHandler()" trigger={<Button onClick={registerLiveStreamChangedHandler} >RegisterLiveStreamChangedHandler</Button>} />
                </div>
                <div className="tag-container">
                    <h3>RegisterMeetingReactionReceivedHandler</h3>
                    <Tooltip content="meeting.registerMeetingReactionReceivedHandler()" trigger={<Button onClick={registerMeetingReactionReceivedHandler} >RegisterMeetingReactionReceivedHandler</Button>} />
                </div>
                <div className="tag-container">
                    <h3>RegisterRaiseHandStateChangedHandler</h3>
                    <Tooltip content="meeting.registerRaiseHandStateChangedHandler()" trigger={<Button onClick={registerRaiseHandStateChangedHandler} >RegisterRaiseHandStateChangedHandler</Button>} />
                </div>
                <div className="tag-container">
                    <h3>RegisterSpeakingStateChangeHandler</h3>
                    <Tooltip content="meeting.registerSpeakingStateChangeHandler()" trigger={<Button onClick={registerSpeakingStateChangeHandler} >RegisterSpeakingStateChangeHandler</Button>} />
                </div>
                <div className="tag-container">
                    <h3>StopSharingAppContentToStage</h3>
                    <Tooltip content="meeting.stopSharingAppContentToStage()" trigger={<Button onClick={stopSharingAppContentToStage} >StopSharingAppContentToStage</Button>} />
                </div>
                <div className="tag-container">
                    <h3>UpdateMicState</h3>
                    <Tooltip content="meeting.updateMicState()" trigger={<Button onClick={updateMicState} >UpdateMicState</Button>} />
                </div>
            </Flex>
        </div>
    )
}