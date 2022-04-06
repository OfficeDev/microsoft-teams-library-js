// import { compareSDKVersions } from '../../src/internal/utils';
// import { app } from '../../src/public';
// import { generateBackCompatRuntimeConfig, versionConstants } from '../../src/public/runtime';
// import { Utils } from '../utils';

// describe('runtime', () => {
//   const utils = new Utils();

//   beforeEach(() => {
//     utils.processMessage = null;
//     utils.messages = [];
//     utils.childMessages = [];
//     utils.childWindow.closed = false;
//   });

//   afterEach(() => {
//     if (app._uninitialize) {
//       app._uninitialize();
//     }
//   });

//   describe('generateBackCompatRuntimeConfig', () => {
//     Object.entries(versionConstants).forEach(([version, capabilities]) => {
//       const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
//         generateBackCompatRuntimeConfig(version).supports,
//       ).replace(/[{}]/g, '');
//       capabilities.forEach(supportedCapability => {
//         const capability = JSON.stringify(supportedCapability.capability).replace(/[{}]/g, '');
//         supportedCapability.hostClientTypes.forEach(clientType => {
//           // this only checks that host clients with the same version number supports that specific capability
//           // but not that it supports every capability with required versions lower than the host's supported
//           // version.
//           it(`Back compat host client type ${clientType} supporting up to ${version} should support ${capability.replace(
//             /:/g,
//             ' ',
//           )} capability`, async () => {
//             await utils.initializeWithContext('content', clientType);
//             expect(generatedRuntimeConfigSupportedCapabilities.includes(capability)).toBe(true);
//           });

//           // should not support capabilities above version

//           // should not work in disallowed host client types
//         });
//       });
//     });

//     it('Back compat should return false when not proper version is supported', async () => {
//       await utils.initializeWithContext('content', 'ios');
//       const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
//         generateBackCompatRuntimeConfig('1.4.5').supports,
//       ).replace(/[{}]/g, '');
//       expect(generatedRuntimeConfigSupportedCapabilities.includes('location')).toBe(false);
//     });
//   });
// });
