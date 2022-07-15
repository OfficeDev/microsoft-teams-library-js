import './styles.css';

import { Title1 } from '@fluentui/react-components';
import { User } from '@microsoft/microsoft-graph-types';
import React from 'react';

interface UserProps {
  userInfo: User;
}
export const MainPage: React.FC<UserProps> = (props: UserProps) => {
  const { userInfo } = props;

  return (
    <div className="sub-flex-container">
      <Title1 className="mainPageHeader" block>
        Hello, <strong> {userInfo.displayName} </strong>
      </Title1>
    </div>
  );
};
