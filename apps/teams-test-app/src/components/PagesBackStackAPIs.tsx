import { navigateBack, pages, registerBackButtonHandler } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ApiContainer } from './utils/ApiContainer';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NavigateBack = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'navigateBack',
    title: 'Navigate Back',
    onClick: {
      withPromise: async () => {
        await pages.backStack.navigateBack();
        return 'Completed';
      },
      withCallback: (setResult) => {
        const onComplete = (status: boolean, reason?: string): void => {
          if (!status) {
            if (reason) {
              setResult(JSON.stringify(reason));
            } else {
              setResult("Status is false but there's not reason?! This shouldn't happen.");
            }
          } else {
            setResult('Completed');
          }
        };
        navigateBack(onComplete);
      },
    },
  });

const CheckPageBackStackCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageBackStackCapability',
    title: 'Check Page BackStack Call',
    onClick: async () => `Pages.backStack module ${pages.backStack.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesBackStackAPIs = (): ReactElement => {
  const [totalStates, setTotalStates] = React.useState(0);

  const [addStatesValue, setAddStatesValue] = React.useState('');
  const [registerBackButtonHandlerValue, setRegisterBackButtonHandlerValue] = React.useState('');

  const onAddStatesClick = React.useCallback(() => {
    const newNumStates = totalStates + 1;
    setTotalStates(newNumStates);
    window.history.pushState({ some: 'state', id: newNumStates }, 'tab state' + newNumStates, '/testTab');

    window.addEventListener(
      'popstate',
      (event): void => {
        if (event.state && event.state.id) {
          setAddStatesValue('onpopstate: back button clicked. total remaining state: ' + event.state.id);
        }
      },
      false,
    );

    setAddStatesValue('total States: ' + newNumStates);
  }, [totalStates, setTotalStates, setAddStatesValue]);

  const onRegisterBackButtonHandler = React.useCallback(() => {
    const registerBackButtonHandlerHelper = (): boolean => {
      if (totalStates > 0) {
        const newNumStates = totalStates - 1;
        setTotalStates(newNumStates);
        setRegisterBackButtonHandlerValue('back button clicked. total remaining state: ' + newNumStates);
        return true;
      }
      return false;
    };

    if (isTestBackCompat()) {
      registerBackButtonHandler((): boolean => {
        return registerBackButtonHandlerHelper();
      });
    } else {
      pages.backStack.registerBackButtonHandler((): boolean => {
        return registerBackButtonHandlerHelper();
      });
    }

    setRegisterBackButtonHandlerValue('total States: ' + totalStates);
  }, [totalStates]);

  return (
    <ModuleWrapper title="Pages.backStack">
      <NavigateBack />
      <ApiContainer name="addStates" title="Add States" result={addStatesValue}>
        <input name="button_addStates" type="button" value="Add States" onClick={onAddStatesClick} />
      </ApiContainer>
      <ApiContainer
        name="registerBackButtonHandler"
        title="Register Back Button Handler"
        result={registerBackButtonHandlerValue}
      >
        <input
          name="button_registerBackButtonHandler"
          type="button"
          value="Register Back Button Handler"
          onClick={onRegisterBackButtonHandler}
        />
      </ApiContainer>
      <CheckPageBackStackCapability />
    </ModuleWrapper>
  );
};

export default PagesBackStackAPIs;
