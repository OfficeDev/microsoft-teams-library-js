# teamsjs Test App

The teamsjs Test App is a React app meant to be run inside teamsjs hubs to not only test teamsjs hubs but also test the teamsjs App SDK, test the teamsjs Hub SDK, be used as a reference on what a teamsjs App can look like, and be of use for anything else you'd like to use it for. 

## Getting Started

If you want to test whether your teamsjs hub can run this app and interact with it correctly, you can use the JSON manifest information below. 

NOTE: THE WEBSITE ADDRESS BELOW WILL CHANGE SOON.
```
appId: "teamsjstestapp",
galleryTabs: [
    {
        configurationUrl: "https://teamsjstestapp.azurewebsites.net/"
    }
],
staticTabs: [
    {
        contentUrl: "https://teamsjstestapp.azurewebsites.net/"
    }
],
validDomains: ["https://teamsjstestapp.azurewebsites.net/"],
showTabLoadingIndicator: true,
webApplicationInfo: {
    id: "teamsjstestapp",
    resource: "https://teamsjstestapp.azurewebsites.net/"
}
```

If you would like to run this app locally, please follow the steps below. Please note many of the functions in the test app will only work as intended while being run in a teamsjs hub as they communicate with the hub to be carried out.

```
cd {monorepo root}

// Ensuring you have installed and built the App SDK
yarn install-app-sdk
yarn build-app-sdk

yarn build-test-app
yarn start-test-app
```

or to build and run from the project directory teamsjs-test-app, simply `yarn build` and `yarn start`.

## Troubleshooting

* If you see a directory view of some files after starting the app rather than the test app itself (which should simply be some boxes and buttons), please try removing all three node_modules folders from the repo (the node_modules folders are in the monorepo root, the root/examples/teamsjs-test-app folder, and the root/teamsjs-app-sdk folder) then redoing the yarn commands above.