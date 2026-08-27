import { FrameContexts } from '../../src/public';
import * as app from '../../src/public/app/app';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import * as calendar from '../../src/public/calendar';
import { loadFixtureCase } from '../contract/loadFixtureCase';
import { Utils } from '../utils';

describe('calendar contract', () => {
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

  it('emits the fixture-defined openCalendarItem wire message', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });
    const fixtureCase = loadFixtureCase<calendar.OpenCalendarItemParams>(
      'calendar',
      'openCalendarItem API Call - Success',
    );

    const openCalendarItemPromise = calendar.openCalendarItem(fixtureCase.inputValue);
    const message = utils.findMessageByFunc('calendar.openCalendarItem');

    expect(message).not.toBeNull();
    if (!message) {
      throw new Error('calendar.openCalendarItem message not found');
    }
    expect(message.args).toEqual([fixtureCase.inputValue]);

    await utils.respondToMessage(message, true);
    await expect(openCalendarItemPromise).resolves.toBeUndefined();
  });
});
