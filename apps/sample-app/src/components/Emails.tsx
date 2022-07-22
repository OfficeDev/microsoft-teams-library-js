import { DocumentCard, DocumentCardTitle } from '@fluentui/react';
import { Text } from '@fluentui/react-components';
import { Message } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { handleOpenMailItem } from './utils';

interface EmailProps {
  messages: Message[];
}
export interface MessageListItem {
  key?: string;
  subject?: string;
  sender?: string;
}
export const EmailList: React.FC<EmailProps> = (props: EmailProps) => {
  const { messages } = props;
  const emailItems = messages.map<MessageListItem>(m => {
    return {
      key: m.id,
      subject: m.subject || '',
      sender: m.sender?.emailAddress?.name || '',
    };
  });

  const EmailExample: React.FunctionComponent = () => {
    return (
      <div>
        {emailItems.map(emailItem => (
          <Text as="span" key={emailItem.key}>
            <button key={emailItem.key}>
              <div>
                <DocumentCard key={emailItem.key} onClick={() => handleOpenMailItem(emailItem)}>
                  <DocumentCardTitle title={emailItem.subject || ''} shouldTruncate />
                  <DocumentCardTitle title={emailItem.sender || ''} shouldTruncate showAsSecondaryTitle />
                </DocumentCard>
              </div>
            </button>
          </Text>
        ))}
      </div>
    );
  };
  return (
    <div>
      <EmailExample />
    </div>
  );
};
