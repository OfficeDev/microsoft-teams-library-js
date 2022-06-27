/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { IStackTokens, Stack } from '@fluentui/react';
import { Button } from '@fluentui/react-components';
import * as React from 'react';

export interface IButtonExampleProps {
  // These are set based on the toggles shown above the examples (not needed in real code)
  disabled?: boolean;
  checked?: boolean;
}

// Example formatting
const stackTokens: IStackTokens = { childrenGap: 40 };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ButtonDefaultExample = () => {
  return (
    <Stack horizontal tokens={stackTokens}>
      <Button appearance="primary">Get started</Button>
      <Button appearance="primary" onClick={_alertClicked}>
        Standard
      </Button>
      <Button appearance="primary" onClick={_alertSessionId}>
        Primary
      </Button>
    </Stack>
  );
};

function _alertClicked(): void {
  alert('Clicked');
}

function _alertSessionId(): void {
  alert('Clicked');
}
