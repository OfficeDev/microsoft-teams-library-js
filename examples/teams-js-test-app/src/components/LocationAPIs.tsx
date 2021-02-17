import React from 'react';
import { location } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const LocationAPIs = () => {
  const [getGetLocation, setGetLocation] = React.useState("");
  const [getShowLocation, setShowLocation] = React.useState("");

  const returnGetLocation = (locationProps: any) => {
    setGetLocation("location.getLocation()" + noHubSdkMsg);
    location.getLocation(locationProps, (err: teamsjs.SdkError, location: teamsjs.location.Location) => {
      if (err) {
        setGetLocation(err.errorCode.toString + " " + err.message);
        return;
      }
      setGetLocation(JSON.stringify(location));
    });
  };

  const returnShowLocation = (location: any) => {
    setShowLocation("location.showLocation()" + noHubSdkMsg);
    location.showLocation(location, (err: teamsjs.SdkError, result: boolean) => {
      if (err) {
        setShowLocation(err.errorCode.toString + " " + err.message);
        return;
      }
      setShowLocation("result: " + result);
    });
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnGetLocation}
        output={getGetLocation}
        hasInput={true}
        title="Get Location"
        name="getLocation"
      />
      <BoxAndButton
        handleClick={returnShowLocation}
        output={getShowLocation}
        hasInput={true}
        title="Show Location"
        name="showLocation"
      />
    </>
  );
};

export default LocationAPIs;
