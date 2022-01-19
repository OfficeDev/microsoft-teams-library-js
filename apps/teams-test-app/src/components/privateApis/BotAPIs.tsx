import { bot } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckBotCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkBotCapability',
    title: 'Check Bot Capability',
    onClick: async () => `Bot ${bot.isSupported() ? 'is' : 'is not'} supported`,
  });

const SendQuery = (): React.ReactElement =>
  ApiWithTextInput<bot.QueryRequest>({
    name: 'sendQuery',
    title: 'sendQuery',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('botRequest is required.');
        }
      },
      submit: input => {
        return new Promise<string>((res, rej) => {
          const onSuccess = (data: bot.QueryResponse): void => {
            res(JSON.stringify(data));
          };
          const onError = (error: string): void => {
            rej(JSON.stringify(error));
          };
          bot.sendQuery(input, onSuccess, onError);
        });
      },
    },
  });

const GetSupportedCommands = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getSupportedCommands',
    title: 'getSupportedCommands',
    onClick: () => {
      return new Promise<string>((res, rej) => {
        const onSuccess = (data: bot.Command[]): void => {
          res(JSON.stringify(data));
        };
        const onError = (error: string): void => {
          rej(JSON.stringify(error));
        };
        bot.getSupportedCommands(onSuccess, onError);
      });
    },
  });

const Authenticate = (): React.ReactElement =>
  ApiWithTextInput<bot.AuthQueryRequest>({
    name: 'authenticate',
    title: 'authenticate',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('botRequest is required.');
        }
      },
      submit: input => {
        return new Promise<string>((res, rej) => {
          const onSuccess = (data: bot.Results): void => {
            res(JSON.stringify(data));
          };
          const onError = (error: string): void => {
            rej(JSON.stringify(error));
          };
          bot.authenticate(input, onSuccess, onError);
        });
      },
    },
  });

const BotAPIs = (): React.ReactElement => (
  <>
    <h1>bot</h1>
    <SendQuery />
    <GetSupportedCommands />
    <Authenticate />
    <CheckBotCapability />
  </>
);

export default BotAPIs;
