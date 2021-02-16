import React from 'react';
import { teamsCore } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const TeamsCoreAPIs = () => {
  const [registerChangeSettingsHandler, setRegisterChangeSettingsHandler] = React.useState("");
  const [registerAppButtonClickHandler, setRegisterAppButtonClickHandler] = React.useState("");
  const [registerAppButtonHoverEnterHandler, setRegisterAppButtonHoverEnterHandler] = React.useState("");
  const [registerAppButtonHoverLeaveHandler, setRegisterAppButtonHoverLeaveHandler] = React.useState("");
  const [getTabInstance, setTabInstance] = React.useState("");
  const [getMRUTabInstance, setMRUTabInstance] = React.useState("");
  const [registerBeforeUnload, setRegisterBeforeUnload] = React.useState("");
  const [registerBackButtonHandler, setRegisterBackButtonHandler] = React.useState("");
  const [totalStates, setTotalStates] = React.useState(0);
  const [addStates, setAddStates] = React.useState("");

  const returnRegisterChangeSettingsHandler = () => {
    setRegisterChangeSettingsHandler("teamsCore.registerChangeSettingsHandler()" + noHubSdkMsg);
    teamsCore.registerChangeSettingsHandler(() => {
      setRegisterChangeSettingsHandler("successfully called");
    });
  };

  const returnRegisterAppButtonClickHandler = () => {
    setRegisterAppButtonClickHandler("teamsCore.registerAppButtonClickHandler()" + noHubSdkMsg);
    teamsCore.registerAppButtonClickHandler(() => {
      setRegisterAppButtonClickHandler("successfully called");
    });
  };

  const returnRegisterAppButtonHoverEnterHandler = () => {
    setRegisterAppButtonHoverEnterHandler("teamsCore.registerAppButtonHoverEnterHandler()" + noHubSdkMsg);
    teamsCore.registerAppButtonHoverEnterHandler(() => {
      setRegisterAppButtonHoverEnterHandler("successfully called");
    });
  };

  const returnRegisterAppButtonHoverLeaveHandler = () => {
    setRegisterAppButtonHoverLeaveHandler("teamsCore.registerAppButtonHoverLeaveHandler()" + noHubSdkMsg);
    teamsCore.registerAppButtonHoverLeaveHandler(() => {
      setRegisterAppButtonHoverLeaveHandler("successfully called");
    });
  };

  const returnGetTabInstances = () => {
    setTabInstance("teamsCore.getTabInstances()" + noHubSdkMsg);
    teamsCore.getTabInstances((tabInfo: any) => {
      setTabInstance(JSON.stringify(tabInfo));
    });
  };

  const returnGetMRUTabInstances = () => {
    setMRUTabInstance("teamsCore.getMruTabInstances()" + noHubSdkMsg);
    teamsCore.getMruTabInstances((tabInfo: any) => {
      setMRUTabInstance(JSON.stringify(tabInfo));
    });
  };

  const returnRegisterBeforeUnload = (readyToUnloadDelay: any) => {
    setRegisterBeforeUnload("teamsCore.registerBeforeUnload()" + noHubSdkMsg);
    const delay = Number(readyToUnloadDelay);
    teamsCore.registerBeforeUnloadHandler(function (readyToUnload) {
      (window as any).readyToUnload = readyToUnload;
      setTimeout(() => {
        readyToUnload();
      }, delay);
      alert(`beforeUnload received; calling readyToUnload in ${delay / 1000} seconds`);
      setRegisterBeforeUnload("Success");
      return true;
    });
  };

  const returnAddStates = () => {
    let newNumStates = totalStates + 1;
    setTotalStates(newNumStates);
    window.history.pushState({ some: 'state', id: newNumStates }, "tab state" + newNumStates, '/testTab');
    setAddStates("total States: " + newNumStates);
    window.addEventListener('popstate', function (event) {
      if (event.state && event.state.id) {
        setAddStates("onpopstate: back button clicked. total remaining state: " + event.state.id);
      }
    }, false);
  };

  const returnRegisterBackButtonHandler = () => {
    setRegisterBackButtonHandler("total States: " + totalStates);
    teamsCore.registerBackButtonHandler(function () {
      if (totalStates > 0) {
        let newNumStates = totalStates - 1;
        setTotalStates(newNumStates);
        setRegisterBackButtonHandler("back button clicked. total remaining state: " + newNumStates);
        return true;
      }
      return false;
    });
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnRegisterChangeSettingsHandler}
        output={registerChangeSettingsHandler}
        hasInput={false}
        title="Register Change Settings Handler"
        name="registerChangeSettingsHandler"
      />
      <BoxAndButton
        handleClick={returnRegisterAppButtonClickHandler}
        output={registerAppButtonClickHandler}
        hasInput={false}
        title="Register App Button Click Handler"
        name="registerAppButtonClickHandler"
      />
      <BoxAndButton
        handleClick={returnRegisterAppButtonHoverEnterHandler}
        output={registerAppButtonHoverEnterHandler}
        hasInput={false}
        title="Register App Button Hover Enter Handler"
        name="registerAppButtonHoverEnterHandler"
      />
      <BoxAndButton
        handleClick={returnRegisterAppButtonHoverLeaveHandler}
        output={registerAppButtonHoverLeaveHandler}
        hasInput={false}
        title="Register App Button Hover Leave Handler"
        name="registerAppButtonHoverLeaveHandler"
      />
      <BoxAndButton
        handleClick={returnGetTabInstances}
        output={getTabInstance}
        hasInput={false}
        title="Get Tab Instance"
        name="getTabInstance"
      />
      <BoxAndButton
        handleClick={returnGetMRUTabInstances}
        output={getMRUTabInstance}
        hasInput={false}
        title="Get MRU Tab Instance"
        name="getMRUTabInstance"
      />
      <BoxAndButton
        handleClick={returnRegisterBeforeUnload}
        output={registerBeforeUnload}
        hasInput={true}
        title="Register Before Unload"
        name="registerBeforeUnload"
      />
      <BoxAndButton
        handleClick={returnAddStates}
        output={addStates}
        hasInput={false}
        title="Add States"
        name="addStates"
      />
      <BoxAndButton
        handleClick={returnRegisterBackButtonHandler}
        output={registerBackButtonHandler}
        hasInput={false}
        title="Register Back Button Handler"
        name="registerBackButtonHandler"
      />
    </>
  );
};

export default TeamsCoreAPIs;
