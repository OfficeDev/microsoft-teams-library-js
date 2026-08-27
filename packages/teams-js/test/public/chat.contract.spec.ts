import { FrameContexts } from '../../src/public';
import * as app from '../../src/public/app/app';
import * as chat from '../../src/public/chat';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { loadFixtureCase } from '../contract/loadFixtureCase';
import { Utils } from '../utils';

interface OpenChatWirePayload {
  members: string[];
  message?: string;
  topic?: string;
}

describe('chat contract', () => {
  let utils: Utils;

  beforeEach(() => {
    utils = new Utils();
  });

  afterEach(() => {
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  it('emits the fixture-defined openGroupChat wire message', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });
    const fixtureCase = loadFixtureCase<chat.OpenGroupChatRequest, OpenChatWirePayload>(
      'chat',
      'openGroupChat API Call - Success',
    );

    expect(fixtureCase.expectedWirePayload).toBeDefined();

    const openGroupChatPromise = chat.openGroupChat(fixtureCase.inputValue);
    const message = utils.findMessageByFunc('chat.openChat');

    expect(message).not.toBeNull();
    if (!message) {
      throw new Error('chat.openChat message not found');
    }
    expect(message.args).toEqual([fixtureCase.expectedWirePayload]);

    await utils.respondToMessage(message, true);
    await expect(openGroupChatPromise).resolves.toBeUndefined();
  });
});
