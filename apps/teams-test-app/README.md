# Teams Test App

The Teams Test App is a React app used to test the Teams JavaScript client SDK and Host SDK. It is currently being developed to be used only for this testing and is not meant to serve as official guidance for SDK use for the time being. 

## Getting Started

### Running the Test App on its own

If you would like to run this app on its own locally, please follow the steps below. Please note many of the functions in the test app will only work as intended while being run in a host as they communicate with the host to be carried out.

```
cd {monorepo root}

// Ensuring you have installed and built the Teams JavaScript client SDK
yarn install
yarn build-sdk

yarn build-test-app
yarn start-test-app
```

or if you have already built the Teams JavaScript client SDK and would like to build and run directly from the project directory teams-test-app, simply `yarn build` and `yarn start` there.

## Troubleshooting

* If you see a directory view of some files after starting the app rather than the test app itself (which should simply be some boxes and buttons), please try removing all three node_modules folders from the repo (you can utilize our yarn clean:all command at the monorepo root) then redoing the yarn commands above.

* Due to Windows loopback security features, you may see a warning from your browser when running the test app saying that your connection is not private. Click Advanced -> Continue to localhost to proceed to the app.