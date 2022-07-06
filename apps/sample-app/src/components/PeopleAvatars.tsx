import './styles.css';

import { Avatar, Tooltip } from '@fluentui/react-components';
import { Message } from '@microsoft/microsoft-graph-types';
import React from 'react';
interface MeetingProps {
  messages: Message[];
}

export const PeopleAvatarList: React.FC<MeetingProps> = (props: MeetingProps) => {
  const { messages } = props;
  interface AvatarItem {
    id?: string | undefined;
    name?: string;
  }
  const AvatarItemList: AvatarItem[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message['attendees'].length > 15 || message['attendees'].length === 0) {
      continue;
    }
    if (message['subject']?.includes('OOF')) {
      continue;
    }
    for (let j = 0; j < messages[i]['attendees'].length; j++) {
      const attendee = message['attendees'][j];
      const item: AvatarItem = {
        id: attendee['emailAddress']['address'] || '',
        name: attendee['emailAddress']['name'] || '',
      };
      AvatarItemList.push(item);
    }
  }

  const AvatarExample: React.FunctionComponent = () => {
    //Need to change label of each hover trigger on Avatar
    /// goal: person name, capabailites of call/mail/text
    return (
      <div>
        {AvatarItemList.map(a => (
          <Tooltip content="Sample text" relationship={'label'} key={a.id}>
            {triggerProps => (
              <span key={a.id}>
                <button {...triggerProps} key={a.id}>
                  <Avatar key={a.id} {...a} color="colorful" size={56} />
                </button>
              </span>
            )}
          </Tooltip>
        ))}
      </div>
    );
  };
  return (
    <div>
      <AvatarExample />
    </div>
  );
};
