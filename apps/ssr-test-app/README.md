# SSR Test App

The SSR Test App is a React and NextJS app that serves to ensure any future changes to teams-js do not break server-side rendering capabilities. As it is included in the apps workspace, it will also be built when building teams-js.
If there are any changes made to teams-js that should break server-side rendering capabilities, the build should fail when it attempts to build the SSR Test App.

# Running the Test App on its own

In order to run the SSR Test App on its own, please follow the following steps

```
cd {monorepo root}

// Ensuring you have installed and built the Teams JavaScript client SDK
pnpm install
pnpm build

pnpm start-ssr-app
```

or if you have already built the Teams JavaScript client SDK and would like to build and run directly from the project directory ssr-test-app, simply `pnpm build` and `pnpm start` there.

### Note

Running the SSR Test App locally defaults to using an unsecure http connection. In order to run the SSR test app in the Orange app, a secure https connection is required. This can be achieved by generating an SSL certificate. Alternatively, ngrok can be used to generate a secure https connection without the need to generate an SSL certificate.

# Troubleshooting

If your build is succeeding locally, however is failing in the PR, it is possible your local version is building the SSR Test App with a cached version of teams-js without the breaking changes. If this is the case,
simply delete your node_modules folder in the ssr-test-app directory, then redo the pnpm commmands above.
