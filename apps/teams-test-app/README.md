# Teams Test App

The Teams Test App is a React app used to test the Teams JavaScript client SDK and Host SDK. It is currently being developed to be used only for this testing and is not meant to serve as official guidance for SDK use for the time being.

## Getting Started

### Running the Test App on its own

If you would like to run this app on its own locally, please follow the steps below. Please note many of the functions in the test app will only work as intended while being run in a host as they communicate with the host to be carried out.

```
cd {monorepo root}

// Ensuring you have installed and built the Teams JavaScript client SDK
pnpm install
pnpm build

pnpm start-test-app
```

or if you have already built the Teams JavaScript client SDK and would like to build and run directly from the project directory teams-test-app, simply `pnpm build` and `pnpm start` there.

## Troubleshooting

- If you see a directory view of some files after starting the app rather than the test app itself (which should simply be some boxes and buttons), please try removing all three node_modules folders from the repo (you can utilize our pnpm clean:all command at the monorepo root) then redoing the pnpm commands above.

- Due to Windows loopback security features, you may see a warning from your browser when running the test app saying that your connection is not private. Click Advanced -> Continue to localhost to proceed to the app.

## Contributing

### API Utility Components

There's a set of helper React Components that can be used to add support to new APIs into the Test App.
They are meant to keep the UI and generated HTML to be consistent, to allow for E2E scenario tests to be written against it.

#### `ApiWithoutInput`

Should be used to add support for an API which does not require any user input, e.g. `app.getContext()`.

#### `ApiWithCheckboxInput`

Should be used to add support for an API which requires a `true`/`false` input, e.g. `pages.returnFocus(navigateForward?: boolean)`.

#### `ApiWithTextInput`

Should be used to add support for an API which requires a more complex input, e.g. `calendar.composeMeeting(composeMeetingParams: ComposeMeetingParams)`.

There are two possible ways to leverage `ApiWithTextInput` component:

- APIs for which the input has no required properties and no validation is needed, a simple `onClick` callback can be provided.
  In this case `ApiWithTextInput` will attempt to parse the input as JSON and call the provided callback.

- For all other APIs `onClick` required two callbacks to be provided: `validateInput` and `submit`.
  `ApiWithTextInput` component will attempt to parse the input as JSON and call `validateInput` to allow for input validation.
  The validation function should throw an exception when the input requirements are not satisfied (e.g. a required property in not present).
  If validation fails, the error will be shown in the Test App.
  If validation passes, `submit` will be called.

### Capability section

For each capability a separate section should be added, which should consist of a header and a collection of the utility components described above.
That section should be added in a separate file undef src\components, and referenced in the top-level `<App />` component.
