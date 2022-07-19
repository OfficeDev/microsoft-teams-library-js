import './styles.css';

import { Avatar, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Text, Tooltip } from '@fluentui/react-components';
import { Message, User } from '@microsoft/microsoft-graph-types';
import React from 'react';

import { getSupportedCapabilities, handleAudioCall, handleMail, handleMessage, handleVideoCall } from './utils';

interface AvatarProps {
  messages: Message[];
  user: User;
}

export interface AvatarItem {
  id?: string | undefined;
  name?: string;
}
interface AvatarProps {
  messages: Message[];
  user: User;
}

export interface AvatarItem {
  id?: string | undefined;
  name?: string;
}

export const PeopleAvatarList: React.FC<AvatarProps> = (props: AvatarProps) => {
  const messages = props.messages;
  const user = props.user;
  const AvatarItemList: AvatarItem[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (
      message['attendees'].length > 15 ||
      message['subject']?.includes('OOF') ||
      message['subject']?.includes('Canceled')
    ) {
      continue;
    }
    for (let j = 0; j < messages[i]['attendees'].length; j++) {
      if (message['attendees'][j] === user.displayName) {
        continue;
      }
      const attendee = message['attendees'][j];
      const item: AvatarItem = {
        id: attendee['emailAddress']['address'] || '',
        name: attendee['emailAddress']['name'] || '',
      };
      if (item.name === user.displayName) {
        continue;
      } else {
        AvatarItemList.push(item);
      }
    }
  }
  const AvatarExample: React.FunctionComponent = () => {
    const capabilities = getSupportedCapabilities();
    return (
      <div>
        {AvatarItemList.map(a => (
          <Tooltip
            content={
              <>
                <Text weight="semibold" as="span">
                  {a.name}
                </Text>
                <MenuList>
                  {capabilities.map(c => (
                    <div key={c}>
                      {c === 'Call' && (
                        <Menu>
                          <MenuTrigger>
                            <MenuItem>Call</MenuItem>
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem onClick={() => handleAudioCall(a)}>Audio {c}</MenuItem>
                              <MenuItem onClick={() => handleVideoCall(a)}> Video {c}</MenuItem>
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      )}
                      {c === 'Message' && <MenuItem onClick={() => handleMessage(a)}> {c}</MenuItem>}
                      {c === 'Mail' && <MenuItem onClick={() => handleMail(a)}>{c}</MenuItem>}
                    </div>
                  ))}
                </MenuList>
              </>
            }
            key={a.id}
            relationship={'label'}
          >
            <Text as="span" key={a.id}>
              <button key={a.id}>
                <Avatar key={a.id} {...a} color="colorful" size={56} />
              </button>
            </Text>
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
