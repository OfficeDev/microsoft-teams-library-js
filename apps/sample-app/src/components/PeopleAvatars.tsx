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
    // 5 is an arbitrary number to show only relevant meetings
    if (message['attendees'].length > 5 || message['isCancelled'] || message['showAs'] === 'free') {
      continue;
    }
    for (let j = 0; j < messages[i]['attendees'].length; j++) {
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
                  {capabilities.map(capability => (
                    <div key={capability}>
                      {capability === 'Call' && (
                        <Menu>
                          <MenuTrigger>
                            <MenuItem>Call</MenuItem>
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem onClick={() => handleAudioCall(a)}>Audio {capability}</MenuItem>
                              <MenuItem onClick={() => handleVideoCall(a)}> Video {capability}</MenuItem>
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      )}
                      {capability === 'Message' && <MenuItem onClick={() => handleMessage(a)}> {capability}</MenuItem>}
                      {capability === 'Mail' && <MenuItem onClick={() => handleMail(a)}>{capability}</MenuItem>}
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

  return <AvatarExample />;
};
