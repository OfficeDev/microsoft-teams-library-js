import { IStackTokens, Stack } from '@fluentui/react';
import { Button } from '@fluentui/react-components';
import * as React from 'react';

const stackTokens: IStackTokens = { childrenGap: 40 };

export const SampleButtons: React.FC = () => {
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

export default SampleButtons;
