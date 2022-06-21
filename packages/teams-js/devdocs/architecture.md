# Architecture and API design

## Capability Architecture

The teams-js library provides a suite of APIs that encompass a broad range of functionality across multiple hosts. Different hosts will support different subsets of that functionality (e.g. Outlook may support different functionality than Teams).

The concept of a "capability" has been defined to organize APIs and provide a host-agnostic method for detecting supported functionality. All functionality in the SDK is grouped into these capabilities.

A capability is a logical grouping of APIs that provide similar functionality. A host supports a given capability _only if_ it supports all the APIs defined within that capability. Hosts **cannot** partially implement a capability. Capabilities can be feature or content-based, such a `mail`, `calendar`, `chat`, `dialog`, `authentication`, etc., but there may also be capabilities for application types such as `pages`, or other potential groups not yet anticipated.

In teams-js, APIs are defined as functions in a JavaScript namespace whose name matches their required capability. If an app is running in a host that supports the `calendar` capability, then the app can safely call APIs such as `calendar.openCalendarItem` (as well as other calendar-related APIs defined in the namespace). Meanwhile, if an app attempts to call an API that's not supported in that host, the API will throw an exception.

There are two ways for an app to take a dependency on a given capability:

1. The app will be able to declare the capability as required in its manifest. Hosts will only load apps if they support all the capabilities those apps require. The app will not be listed in the hosts's store if any of its required capabilities are unsupported.
2. If the app doesn't declare a capability as required, then it needs to check for that capability at runtime by calling an `isSupported()` function on that capability and adjust its behavior as appropriate. This allows an app to enable optional UI and functionality in hosts that support it, while continuing to run (and appear in the store) for hosts that don't.

### Subcapabilities

A subcapability is a child namespace of an existing capability namespace (for example, `pages.tabs`: `tabs` is a subcapability within the `pages` capability). Subcapabilities can only be supported if their parent capability is supported. However, the reverse is not true. A host can choose to support only the _parent capability_ without supporting all _subcapabilities_. For example, Outlook may support `pages` but NOT `pages.tabs`. However, if Outlook supports `pages.tabs` it MUST support `pages`. This can make it easier to add new host-specific functionality to common capabilities.

## Compatiblity and capabilities under development

Since hosts must support all functionality in a capability to declare it as "supported," this generally means that _new functions cannot be added to existing shipped capabilities_. If new functions were added to shipped capabilities, older hosts would not have support for the new function and consequently the "all or nothing" capability promise would be violated. New functions can be added as a [subcapability](#subcapabilities), if appropriate.

Since developing new capabilties necessitates some amount of iteration and support rollout time, new capabilities (and their functions) still under development should be TSDoc tagged with the [@beta](https://tsdoc.org/pages/tags/beta/) tag. This ensures that potential consumers are aware that any and all functionality in that capability can change in the future and that they should not use it in production apps.

It **strongly** discouraged that private capabilities be used for this purpose. Develop new capabilities in the public space with [@beta](https://tsdoc.org/pages/tags/beta/) tags.

## Private APIs

Private APIs are **strongly** discouraged and any new functionality or pull request that adds/modifies a private API will be heavily scrutinized.

## Adding an API that utilizes version checks for compatibility

This option should only be used for work that meets ALL of the below requirements:

- Features which have already been discussed with the TeamsJS owners and for which approval to use this approach has been granted,
- Feature implementation that has a requirement of running in host clients that have not onboarded to the new declarative capability support architecture

Here are the steps for adding an API that utilizes version checks (e.g. `if (!isCurrentSDKVersionAtLeast(captureImageMobileSupportVersion)...`):

1. Add the API as a new capability or subcapability rather than adding to an existing capability. Please look at other capabilities such as `calendar.ts` for examples of how to structure a capability. There must be an isSupported() function with every capability which is a simple boolean check for seeing if `runtime.supports` contains the capability.

e.g.

```json
export function isSupported(): boolean {
  return runtime.supports.newCapability? true : false;
}
```

2. In `runtime.ts`, add an object describing the new capability and its compatibility requirements to `versionConstants`. The version number your new capability should go under

e.g.

```json
// Object key is type string, value is type Array<ICapabilityReqs>
'1.9.0': [
    {
      capability: { anAndroidCapability: {} },
      hostClientTypes: [
        HostClientType.android,
        HostClientType.teamsRoomsAndroid,
        HostClientType.teamsPhones,
        HostClientType.teamsDisplays,
      ],
    },
  ],
```

If you're adding a capability to an already existing version requirement, simply add your object to the existing array.

e.g.

```json
// Object key is type string, value is type Array<ICapabilityReqs>
'1.9.0': [
    {
      capability: { anAndroidCapability: {} },
      hostClientTypes: [
        HostClientType.android,
        HostClientType.teamsRoomsAndroid,
        HostClientType.teamsPhones,
        HostClientType.teamsDisplays,
      ],
    },
    {
      capability: { aSecondCapability: {} },
      hostClientTypes: v1HostClientTypes,
    },
  ],
```

3. And that's it! Our unit tests are designed to automatically integrate the new capability, so if the unit tests pass, you're good to go.

## Promises, Not Callbacks

The TeamsJS SDK 2.0 requires that all asynchronous functions be added using Promises instead of callbacks. Promises are a more modern and flexible way of handling asynchronicity than callbacks. New API calls will be rejected if they use callbacks.

BAD

```javascript
export function getFoo(callback: (foo: Foo, sdkError: SdkError) => void): void
{…}
```

GOOD

```javascript
export function getFoo(): Promise<Foo>
{…}
```

## Add Unit Tests

All new functionality requires unit test coverage. Please review the [unit test guidelines](unittesting.md).

## Documentation

The yarn docs command can be run locally and will generate the documentation provided for developers locally using jsdoc. All exported functions should have documentation comments following this rough format:

```javascript
/**
 * Brief, clear description of exactly what this function is intended to do and
 * any side effects it might have (like showing UI to the user)
 * @param One per parameter, describing what the parameter is used for
 * @returns Brief, clear description of what the function returns.
 */
```

For any functions not in the public folder, you must begin the comment with the @hidden tag so it does not show up in intellisense:

```javascript
/**
 * @hidden
 * Brief, clear description of exactly what this function is intended to do and
 * any side effects it might have (like showing UI to the user)
 * @param One per parameter, describing what the parameter is used for
 * @returns Brief, clear description of what the function returns.
 */
```
