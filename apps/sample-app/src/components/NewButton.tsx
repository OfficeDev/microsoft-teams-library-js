import { IStackTokens, Stack } from '@fluentui/react';
import { Button } from '@fluentui/react-components';
import * as React from 'react';

// Example formatting
const stackTokens: IStackTokens = { childrenGap: 60 };

interface BoxAndButtonProps {
  handleClick?: () => void;
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces or dots
  output: string;
}

const NewButton = ({ handleClick, output, title }: BoxAndButtonProps): React.ReactElement => {
  const getOutput = (): void => {
    if (handleClick) {
      handleClick();
    }
  };
  return (
    <Stack horizontal tokens={stackTokens}>
      <Button appearance="primary" onClick={getOutput}>
        {title}
      </Button>
      <div>
        <span id={`text_${name}`} style={{ wordWrap: 'break-word' }}>
          {output}
        </span>
      </div>
    </Stack>
  );
};

export default NewButton;
