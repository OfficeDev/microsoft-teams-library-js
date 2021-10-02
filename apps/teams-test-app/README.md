# Teams Test App

The Teams Test App is a React app used to test the Teams App and Host SDK. It is currently being developed to be used only for this testing and is not meant to serve as official guidance for SDK use for the time being. 

You can find the Teams Test App's released version from our main branch deployed at https://musicalsink.azurewebsites.net. The Teams Test App's version in our develop branch is currently being served at https://cloudroll.azurewebsites.net.

## Getting Started

### Running the Test App on its own

If you would like to run this app on its own locally, please follow the steps below. Please note many of the functions in the test app will only work as intended while being run in a host as they communicate with the host to be carried out.

```
cd {monorepo root}

// Ensuring you have installed and built the App SDK
yarn install
yarn build-sdk

yarn build-test-app
yarn start-test-app
```

or if you have already built the App SDK and would like to build and run directly from the project directory teams-test-app, simply `yarn build` and `yarn start` there.

## Troubleshooting

* If you see a directory view of some files after starting the app rather than the test app itself (which should simply be some boxes and buttons), please try removing all three node_modules folders from the repo (you can utilize our yarn clean:all command at the monorepo root) then redoing the yarn commands above.

* Due to Windows loopback security features, you may see a warning from your browser when running the test app saying that your connection is not private. Click Advanced -> Continue to localhost to proceed to the app.