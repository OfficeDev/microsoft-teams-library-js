import './styles.css';

import { DetailsList } from '@fluentui/react';
import { IPersonaSharedProps, Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import { Stack } from '@fluentui/react/lib/Stack';
import { Message } from '@microsoft/microsoft-graph-types';
import React from 'react';

interface EmailProps {
  messages: Message[];
}

export const EmailList: React.FC<EmailProps> = (props: EmailProps) => {
  const { messages } = props;

  const items = messages.map<MessageListItem>(m => {
    return {
      key: m.id,
      subject: m.subject || '',
      sender: m.sender?.emailAddress?.name || '',
    };
  });

  interface MessageListItem {
    key?: string;
    subject?: string;
    sender?: string;
    persona?: IPersonaSharedProps;
  }

  const personaItems = messages.map<IPersonaSharedProps>(m => {
    return {
      imageInitials: m.sender?.emailAddress?.name?.[0] || '',
      text: m.sender?.emailAddress?.address || '',
      secondaryText: m.subject || '',
      tertiaryText: m.receivedDateTime || '',
    };
  });

  const PersonaBasicExample: React.FunctionComponent = () => {
    return (
      <Stack tokens={{ childrenGap: 10 }}>
        {personaItems.map(p => (
          <Persona key={p.id} {...p} size={PersonaSize.size100} />
        ))}
      </Stack>
    );
  };

  const columns = [
    { key: 'subject', name: 'Subject', fieldName: 'subject', minWidth: 100, maxWidth: 200 },
    { key: 'sender', name: 'Sender', fieldName: 'sender', minWidth: 100, maxWidth: 200 },
  ];

  return (
    <>
      <div className="Email-Data">
        <DetailsList items={items} columns={columns} />
        <p> Last Email sender: {messages[0].sender?.emailAddress?.name} </p>
        <PersonaBasicExample />
        <p> {messages[0].sender?.emailAddress?.name}</p>
      </div>
    </>
  );
};
