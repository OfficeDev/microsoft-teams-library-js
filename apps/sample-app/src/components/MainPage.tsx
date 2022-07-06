import './styles.css';

import { Text } from '@fluentui/react-components';
import { User } from '@microsoft/microsoft-graph-types';
import React from 'react';

interface UserProps {
  userInfo: User;
}
export const MainPage: React.FC<UserProps> = (props: UserProps) => {
  const { userInfo } = props;

  return (
    <div className="mainPageHeader">
      <Text as="p">
        Hello, <strong> {userInfo.displayName} </strong>
      </Text>
    </div>
  );
};
