import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';

const NavigateBack = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'navigateBack',
    title: 'Navigate Back',
    onClick: async () => {
      await pages.backStack.navigateBack();
      return 'Completed';
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

  const AddStates = (): React.ReactElement =>
    ApiWithoutInput({
      name: 'addStates',
      title: 'Add States',
      onClick: async setResult => {
        const newNumStates = totalStates + 1;
        setTotalStates(newNumStates);
        window.history.pushState({ some: 'state', id: newNumStates }, 'tab state' + newNumStates, '/testTab');

        window.addEventListener(
          'popstate',
          (event): void => {
            if (event.state && event.state.id) {
              setResult('onpopstate: back button clicked. total remaining state: ' + event.state.id);
            }
          },
          false,
        );

        return 'total States: ' + newNumStates;
      },
    });

  const RegisterBackButtonHandler = (): React.ReactElement =>
    ApiWithoutInput({
      name: 'registerBackButtonHandler',
      title: 'Register Back Button Handler',
      onClick: async setResult => {
        pages.backStack.registerBackButtonHandler((): boolean => {
          if (totalStates > 0) {
            const newNumStates = totalStates - 1;
            setTotalStates(newNumStates);
            setResult('back button clicked. total remaining state: ' + newNumStates);
            return true;
          }
          return false;
        });

        return 'total States: ' + totalStates;
      },
    });

  return (
    <>
      <h1>pages.backStack</h1>
      <NavigateBack />
      <AddStates />
      <RegisterBackButtonHandler />
      <CheckPageBackStackCapability />
    </>
  );
};

export default PagesBackStackAPIs;
