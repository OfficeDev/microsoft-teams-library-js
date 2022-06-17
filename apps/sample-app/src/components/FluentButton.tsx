import { LockIcon } from '@fluentui/react-icons-northstar';
import { Button } from '@fluentui/react-northstar';
import React from 'react';

const BtnExample = (): React.ReactElement => (
  <Button
    content="Secure payment"
    icon={<LockIcon variables={{ color: 'blue' }} />}
    secondary
    variables={{
      color: 'coral',
      backgroundColor: 'charcoal',
      paddingLeftRightValue: 30,
    }}
  />
);

export default BtnExample;
