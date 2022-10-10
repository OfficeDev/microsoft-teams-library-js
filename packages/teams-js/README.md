# Microsoft Teams JavaScript client SDK

Welcome to the Teams JavaScript client SDK! For breaking changes, please refer to our [changelog](./CHANGELOG.md) in the current `<root>/packages/teams-js` directory.

This JavaScript library is part of the [Microsoft Teams developer platform](https://learn.microsoft.com/microsoftteams/platform/). See full [SDK reference documentation](https://learn.microsoft.com/javascript/api/overview/msteams-client?view=msteams-client-js-latest).

## Getting Started

See [instructions](../../README.md#Getting-Started) in the monorepo root for how to clone and build the repository.

Whenever building or testing the Teams client SDK, you can run `yarn build` or `yarn test` from the packages/teams-js directory.

## Installation

To install the stable [version](https://learn.microsoft.com/javascript/api/overview/msteams-client?view=msteams-client-js-latest):

### npm

`npm install --save @microsoft/teams-js`

### yarn

`yarn add @microsoft/teams-js`

### Production

You can reference these files directly [from here](https://res.cdn.office.net/teams-js/2.4.1/js/MicrosoftTeams.min.js) or point your package manager at them.

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
  src="https://res.cdn.office.net/teams-js/2.4.1/js/MicrosoftTeams.min.js"
  integrity="sha384-l5BX+R3H+6sfSa7KKsqzBsWKsJ9JE9O0a1DqQKtM/RbE1Gb6N6bGYlNJt4EIZZ6X"
  crossorigin="anonymous"
></script>

<!-- Microsoft Teams JavaScript API (via npm) -->
<script src="node_modules/@microsoft/teams-js@2.4.1/dist/MicrosoftTeams.min.js"></script>

<!-- Microsoft Teams JavaScript API (via local) -->
<script src="MicrosoftTeams.min.js"></script>
```

### Dependencies

Teams client SDK depends on [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) type. If you support older browsers and devices which may not yet provide it natively (e.g. IE 11), you need to provide a global polyfill, such as [es6-promise](https://www.npmjs.com/package/es6-promise), in your bundled application. If you're using a script tag to reference the Teams client SDK, you need to make sure the polyfill is included and initialized before the Teams client SDK is.

## Examples

Stay tuned for examples coming soon.

## Testing

The [Teams Test App](https://aka.ms/teams-test-app) is used to validate the Teams client SDK APIs.

## Contributing

Please be sure to check out the [Contributor's guide](../../CONTRIBUTING.md) for crucial steps.
