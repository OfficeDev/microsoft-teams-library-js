import React, { ReactElement } from 'react';
import { pages, TabInformation, teamsCore } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const TeamsCoreAPIs = (): ReactElement => {
  const [enablePrintCapRes, setEnablePrintCapRes] = React.useState('');
  const [printRes, setPrintRes] = React.useState('');
  const [currentFrameRes, setCurrentFrameRes] = React.useState('');
  const [registerAppButtonClickHandlerRes, setRegisterAppButtonClickHandlerRes] = React.useState('');
  const [registerAppButtonHoverEnterHandlerRes, setRegisterAppButtonHoverEnterHandlerRes] = React.useState('');
  const [registerAppButtonHoverLeaveHandlerRes, setRegisterAppButtonHoverLeaveHandlerRes] = React.useState('');
  const [getTabInstanceRes, setGetTabInstanceRes] = React.useState('');
  const [getMRUTabInstanceRes, setGetMRUTabInstanceRes] = React.useState('');
  const [registerBeforeUnloadRes, setRegisterBeforeUnloadRes] = React.useState('');
  const [addStatesRes, setAddStatesRes] = React.useState('');
  const [registerBackButtonHandlerRes, setRegisterBackButtonHandlerRes] = React.useState('');
  const [totalStates, setTotalStates] = React.useState(0);
  const [checkPagesTabsCapabilityRes, setCheckPagesTabsCapabilityRes] = React.useState('');
  const [registerOnLoadRes, setRegisterOnLoadRes] = React.useState('');
  const [registerFullScreenChangeHandlerRes, setRegisterFullScreenChangeHandlerRes] = React.useState('');

  const enablePrintCapability = (): void => {
    teamsCore.enablePrintCapability();
    setEnablePrintCapRes('called');
  };

  const print = (): void => {
    teamsCore.print();
    setPrintRes('called');
  };

  const setCurrentFrame = (frameContextInput: string): void => {
    pages.setCurrentFrame(JSON.parse(frameContextInput));
    setCurrentFrameRes('called');
  };

  const registerAppButtonClickHandler = (): void => {
    setRegisterAppButtonClickHandlerRes('teamsCore.registerAppButtonClickHandler()' + noHubSdkMsg);
    pages.registerAppButtonClickHandler((): void => {
      setRegisterAppButtonClickHandlerRes('successfully called');
    });
  };

  const registerAppButtonHoverEnterHandler = (): void => {
    setRegisterAppButtonHoverEnterHandlerRes('teamsCore.registerAppButtonHoverEnterHandler()' + noHubSdkMsg);
    pages.registerAppButtonHoverEnterHandler((): void => {
      setRegisterAppButtonHoverEnterHandlerRes('successfully called');
    });
  };

  const registerAppButtonHoverLeaveHandler = (): void => {
    setRegisterAppButtonHoverLeaveHandlerRes('teamsCore.registerAppButtonHoverLeaveHandler()' + noHubSdkMsg);
    pages.registerAppButtonHoverLeaveHandler((): void => {
      setRegisterAppButtonHoverLeaveHandlerRes('successfully called');
    });
  };

  const getTabInstances = (input: string): void => {
    const tabInstanceParams = input ? JSON.parse(input) : undefined;
    setGetTabInstanceRes('teamsCore.getTabInstances()' + noHubSdkMsg);
    pages.tabs.getTabInstances((tabInfo: TabInformation): void => {
      setGetTabInstanceRes(JSON.stringify(tabInfo));
    }, tabInstanceParams);
  };

  const getMRUTabInstances = (input: string): void => {
    const tabInstanceParams = input ? JSON.parse(input) : undefined;
    setGetMRUTabInstanceRes('teamsCore.getMruTabInstances()' + noHubSdkMsg);
    pages.tabs.getMruTabInstances((tabInfo: TabInformation): void => {
      setGetMRUTabInstanceRes(JSON.stringify(tabInfo));
    }, tabInstanceParams);
  };

  const registerBeforeUnload = (readyToUnloadDelay: string): void => {
    const delay = Number(readyToUnloadDelay);
    setRegisterBeforeUnloadRes('teamsCore.registerBeforeUnload()' + noHubSdkMsg);
    teamsCore.registerBeforeUnloadHandler((readyToUnload): boolean => {
      setTimeout(() => {
        readyToUnload();
      }, delay);
      alert(`beforeUnload received; calling readyToUnload in ${delay / 1000} seconds`);
      setRegisterBeforeUnloadRes('Success');
      return true;
    });
  };

  const addStates = (): void => {
    let newNumStates = totalStates + 1;
    setTotalStates(newNumStates);
    window.history.pushState({ some: 'state', id: newNumStates }, 'tab state' + newNumStates, '/testTab');
    setAddStatesRes('total States: ' + newNumStates);
    window.addEventListener(
      'popstate',
      (event): void => {
        if (event.state && event.state.id) {
          setAddStatesRes('onpopstate: back button clicked. total remaining state: ' + event.state.id);
        }
      },
      false,
    );
  };

  const returnRegisterBackButtonHandler = (): void => {
    setRegisterBackButtonHandlerRes('total States: ' + totalStates);
    pages.backStack.registerBackButtonHandler((): boolean => {
      if (totalStates > 0) {
        let newNumStates = totalStates - 1;
        setTotalStates(newNumStates);
        setRegisterBackButtonHandlerRes('back button clicked. total remaining state: ' + newNumStates);
        return true;
      }
      return false;
    });
  };

  const registerOnLoadHandler = (): void => {
    setRegisterOnLoadRes('teamsCore.registerOnLoadHandler()' + noHubSdkMsg);
    teamsCore.registerOnLoadHandler((context: teamsjs.LoadContext): void => {
      setRegisterOnLoadRes('successfully called with context:' + JSON.stringify(context));
    });
  };

  const registerFullScreenChangeHandler = (): void => {
    setRegisterFullScreenChangeHandlerRes('teamsCore.registerFullScreenHandler()' + noHubSdkMsg);
    pages.registerFullScreenHandler((isFullScreen: boolean): void => {
      setRegisterFullScreenChangeHandlerRes('successfully called with isFullScreen:' + isFullScreen);
    });
  };

  const pagesTabsCapabilityCheck = (): void => {
    if (pages.tabs.isSupported()) {
      setCheckPagesTabsCapabilityRes('Pages.tabs module is supported');
    } else {
      setCheckPagesTabsCapabilityRes('Pages.tabs module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClick={enablePrintCapability}
        output={enablePrintCapRes}
        hasInput={false}
        title="Enable Print Capability"
        name="enablePrintCapability"
      />
      <BoxAndButton handleClick={print} output={printRes} hasInput={false} title="Print" name="print" />
      <BoxAndButton
        handleClickWithInput={setCurrentFrame}
        output={currentFrameRes}
        hasInput={true}
        title="Set current frame"
        name="setCurrentFrame"
      />
      <BoxAndButton
        handleClick={registerAppButtonClickHandler}
        output={registerAppButtonClickHandlerRes}
        hasInput={false}
        title="Register App Button Click Handler"
        name="registerAppButtonClickHandler"
      />
      <BoxAndButton
        handleClick={registerAppButtonHoverEnterHandler}
        output={registerAppButtonHoverEnterHandlerRes}
        hasInput={false}
        title="Register App Button Hover Enter Handler"
        name="registerAppButtonHoverEnterHandler"
      />
      <BoxAndButton
        handleClick={registerAppButtonHoverLeaveHandler}
        output={registerAppButtonHoverLeaveHandlerRes}
        hasInput={false}
        title="Register App Button Hover Leave Handler"
        name="registerAppButtonHoverLeaveHandler"
      />
      <BoxAndButton
        handleClick={registerFullScreenChangeHandler}
        output={registerFullScreenChangeHandlerRes}
        hasInput={false}
        title="Register Full Screen Change Handler"
        name="registerFullScreenChangeHandler"
      />
      <BoxAndButton
        handleClickWithInput={getTabInstances}
        output={getTabInstanceRes}
        hasInput={true}
        title="Get Tab Instance"
        name="getTabInstance"
      />
      <BoxAndButton
        handleClickWithInput={getMRUTabInstances}
        output={getMRUTabInstanceRes}
        hasInput={true}
        title="Get MRU Tab Instance"
        name="getMRUTabInstance"
      />
      <BoxAndButton
        handleClick={registerOnLoadHandler}
        output={registerOnLoadRes}
        hasInput={false}
        title="Register On Load Handler"
        name="registerOnLoadHandler"
      />
      <BoxAndButton
        handleClickWithInput={registerBeforeUnload}
        output={registerBeforeUnloadRes}
        hasInput={true}
        title="Register Before Unload"
        name="registerBeforeUnload"
      />
      <BoxAndButton
        handleClick={addStates}
        output={addStatesRes}
        hasInput={false}
        title="Add States"
        name="addStates"
      />
      <BoxAndButton
        handleClick={returnRegisterBackButtonHandler}
        output={registerBackButtonHandlerRes}
        hasInput={false}
        title="Register Back Button Handler"
        name="registerBackButtonHandler"
      />
      <BoxAndButton
        handleClick={pagesTabsCapabilityCheck}
        output={checkPagesTabsCapabilityRes}
        hasInput={false}
        title="Check Page Tabs Capability"
        name="checkPageTabsCapability"
      />
    </>
  );
};

export default TeamsCoreAPIs;
