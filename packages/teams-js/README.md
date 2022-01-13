# Microsoft Teams JavaScript client SDK

Welcome to the Teams JavaScript client SDK ! For breaking changes, please refer to our changelog in the monorepo root of the `2.0-preview` branch.

This JavaScript library is part of the [Microsoft Teams developer platform](https://docs.microsoft.com/en-us/microsoftteams/platform/overview?view=msteams-client-js-beta). See full [SDK reference documentation](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client?view=msteams-client-js-beta).

## Getting Started

See [instructions](../../README.md#Getting-Started) in the monorepo root for how to clone and build the repository.

Whenever building or testing the Teams client SDK, you can run `yarn build` or `yarn test` from the packages/teams-js directory.

## Installation

To install the latest [2.0 preview version](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client?view=msteams-client-js-beta):

### npm

`npm install --save @microsoft/teams-js@next`

### yarn

`yarn add @microsoft/teams-js@next`

### Production

You can access [these files on unpkg](https://res.cdn.office.net/teams-js/2.0.0-beta.2/js/MicrosoftTeams.min.js), download them, or point your package manager to them.

## Usage

### As a package

Install either using npm or yarn.

**If you are using any dependency loader** such as [RequireJS](http://requirejs.org/) or [SystemJS](https://github.com/systemjs/systemjs) or module bundler such as [browserify](http://browserify.org/), [webpack](https://webpack.github.io/), you can use `import` syntax to import specific modules. For e.g.

```typescript
import { app } from '@microsoft/teams-js';
```

### As a script tag

Reference the SDK inside of your `.html` page using:

```html
<!-- Microsoft Teams JavaScript API (via CDN) -->
<script
  src="https://res.cdn.office.net/teams-js/2.0.0-beta.2/js/MicrosoftTeams.min.js"
  integrity="sha384-RhShpWwRxSnc+keX0WZxCsf8olaKOOw416Jky+StW6qhctsNR3GMwav/hMB1Snas"
  crossorigin="anonymous"
></script>

<!-- Microsoft Teams JavaScript API (via npm) -->
<script src="node_modules/@microsoft/teams-js@2.0.0-beta.2/dist/MicrosoftTeams.min.js"></script>

<!-- Microsoft Teams JavaScript API (via local) -->
<script src="MicrosoftTeams.min.js"></script>
```

### Dependencies

Teams client SDK depends on [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) type. If you support older browsers and devices which may not yet provide it natively (e.g. IE 11), you need to provide a global polyfill, such as [es6-promise](https://www.npmjs.com/package/es6-promise), in your bundled application. If you're using a script tag to reference the Teams client SDK, you need to make sure the polyfill is included and initialized before the Teams client SDK is.

## Examples

Stay tuned for examples coming soon.

## Testing

The [Teams Test App](https://aka.ms/teams-test-app) is used to validate the Teams client SDK APIs.
