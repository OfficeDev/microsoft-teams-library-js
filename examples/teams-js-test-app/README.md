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

To build from the monorepo root, 

```
yarn build-test-app
```

To run from the monorepo root,
```
yarn start-test-app
```

or to build and run from the project directory teamsjs-test-app, simply `yarn build` and `yarn start`.