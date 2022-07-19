import { DocumentCard, DocumentCardTitle } from '@fluentui/react';
import { Text } from '@fluentui/react-components';
import { Message } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { handleOpenMail } from './Calendar';

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
        {emailItems.map(e => (
          <Text as="span" key={e.key}>
            <button key={e.key}>
              <div>
                <DocumentCard key={e.key} onClick={() => handleOpenMail(e)}>
                  <DocumentCardTitle title={e.subject || ''} shouldTruncate />
                  <DocumentCardTitle title={e.sender || ''} shouldTruncate showAsSecondaryTitle />
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
