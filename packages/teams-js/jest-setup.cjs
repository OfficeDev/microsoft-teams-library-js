/* eslint-disable strict-null-checks/all */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This while TextDecoder is supported in both browser and Node environments, it is not supported in jsdom, which we use for our jest environment.
 * To resolve this issue, we polyfill TextDecoder with the node implementation prior to rujnning the tests.
 */

const TextDecoder = require('util').TextDecoder;
global.TextDecoder = TextDecoder;
