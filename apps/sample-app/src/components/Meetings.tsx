import './styles.css';

import { DetailsList, SelectionMode } from '@fluentui/react';
import { Title3 } from '@fluentui/react-components';
import { Message } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { shouldShowMeeting } from './utils';

interface MeetingProps {
  messages: Message[];
}

export const MeetingList: React.FC<MeetingProps> = (props: MeetingProps) => {
  const { messages } = props;

  const itemList: CalendarListItem[] = [];
  // using a for loop instead of 'map' function to remove instances of 'OOF'
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!shouldShowMeeting(message)) {
      continue;
    }
    const item: CalendarListItem = {
      key: message['id'],
      subject: message['subject'] || '',
      organizer: message['organizer']['emailAddress']['name'] || '',
    };

    itemList.push(item);
  }

  interface CalendarListItem {
    key?: string;
    subject?: string;
    organizer?: string;
  }

  const columns = [
    { key: 'subject', name: 'Subject', fieldName: 'subject', minWidth: 100, maxWidth: 200 },
    { key: 'organizer', name: 'Organizer', fieldName: 'organizer', minWidth: 100, maxWidth: 200 },
  ];

  return (
    <>
      <Title3 block className="paddingClass">
        Your Meetings Today
      </Title3>
      <DetailsList items={itemList} columns={columns} selectionMode={SelectionMode.none} />
    </>
  );
};
