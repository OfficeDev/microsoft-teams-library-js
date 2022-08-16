import './styles.css';

import {
  Avatar,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Text,
  Title3,
  Tooltip,
} from '@fluentui/react-components';
import { Message, User } from '@microsoft/microsoft-graph-types';
import { call, chat, mail } from '@microsoft/teams-js';
import React from 'react';

import { handleAudioCall, handleMail, handleMessage, handleVideoCall, shouldShowMeeting } from './utils';

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
    // 5 is an arbitrary number to show people from relevant meetings
    if (message['attendees'].length > 5 || !shouldShowMeeting(message)) {
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
    return (
      <>
        <Title3 block className="paddingClass">
          People to Meet Today
        </Title3>
        <div>
          {AvatarItemList.map(avatar => (
            <Tooltip
              content={
                <>
                  <Text weight="semibold" as="span">
                    {avatar.name}
                  </Text>
                  <MenuList>
                    {call.isSupported() && (
                      <>
                        <Menu>
                          <MenuTrigger>
                            <MenuItem>Call</MenuItem>
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem onClick={() => handleAudioCall(avatar)}>Audio Call </MenuItem>
                              <MenuItem onClick={() => handleVideoCall(avatar)}> Video Call</MenuItem>
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      </>
                    )}
                    {mail.isSupported() && <MenuItem onClick={() => handleMail(avatar)}>Mail</MenuItem>}
                    {chat.isSupported() && <MenuItem onClick={() => handleMessage(avatar)}>Message </MenuItem>}
                  </MenuList>
                </>
              }
              key={avatar.id}
              relationship={'label'}
            >
              <Avatar key={avatar.id} {...avatar} color="colorful" size={56} />
            </Tooltip>
          ))}
        </div>
      </>
    );
  };

  return <AvatarExample />;
};
