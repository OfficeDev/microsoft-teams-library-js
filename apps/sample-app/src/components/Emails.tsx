import { DocumentCard, DocumentCardActivity, DocumentCardTitle } from '@fluentui/react';
import { Text, Title3 } from '@fluentui/react-components';
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
  importance?: string;
}
export const EmailList: React.FC<EmailProps> = (props: EmailProps) => {
  const { messages } = props;
  const emailItems = messages.map<MessageListItem>((m) => {
    return {
      key: m.id,
      subject: m.subject || '',
      sender: m.sender?.emailAddress?.name || '',
      importance: 'Importance: ' + m.importance || '',
    };
  });
  const EmailExample: React.FunctionComponent = () => {
    return (
      <>
        <Title3 className="paddingClass">Recent Emails</Title3>
        <div className="column">
          {emailItems.map((emailItem) => (
            <Text as="span" key={emailItem.key}>
              <DocumentCard key={emailItem.key} onClick={() => handleOpenMailItem(emailItem)}>
                <DocumentCardTitle title={emailItem.subject || ''} shouldTruncate />
                <DocumentCardActivity
                  activity={emailItem.importance || ''}
                  people={[{ name: emailItem.sender || '', profileImageSrc: '' }]}
                />
              </DocumentCard>
            </Text>
          ))}
        </div>
      </>
    );
  };
  return (
    <div>
      <EmailExample />
    </div>
  );
};
