import { IStackTokens, Stack } from '@fluentui/react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import * as React from 'react';

export interface IButtonExampleProps {
  // These are set based on the toggles shown above the examples (not needed in real code)
  disabled?: boolean;
  checked?: boolean;
}

// Example formatting
const stackTokens: IStackTokens = { childrenGap: 40 };

export const ButtonDefaultExample: React.FunctionComponent<IButtonExampleProps> = props => {
  const { disabled, checked } = props;

  return (
    <Stack horizontal tokens={stackTokens}>
      <DefaultButton text="Standard" onClick={_alertClicked} allowDisabledFocus disabled={disabled} checked={checked} />
      <PrimaryButton
        text="Primary"
        onClick={_alertSessionId}
        allowDisabledFocus
        disabled={disabled}
        checked={checked}
      />
    </Stack>
  );
};

function _alertClicked(): void {
  alert('Clicked');
}

function _alertSessionId(): void {
  alert('Clicked');
}
