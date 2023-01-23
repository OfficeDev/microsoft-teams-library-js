# Teams Perf Test App

The Teams Perf Test App is a React app used to measure Teams App perf running with local host SDK(Orange). This will be used to measure app loading time.

## Getting Started

### Running the Perf Test App

If you would like to run this app on its own locally, please follow the steps below. Please note many of the functions in the test app will only work as intended while being run in a Teams host as they communicate with the host to be carried out.

```
cd {monorepo root}

// Ensuring you have installed and built the Teams JavaScript client SDK
pnpm install
pnpm build-sdk

pnpm build-perf-app
pnpm start-perf-app
```

or if you have already built the Teams JavaScript client SDK and would like to build and run directly from the project directory teams-perf-app, simply `pnpm build` and `pnpm start` there.

## Troubleshooting

- If you see a directory view of some files after starting the app rather than the test app itself (which should simply be some boxes and buttons), please try removing all three node_modules folders from the repo (you can utilize our pnpm clean:all command at the monorepo root) then redoing the pnpm commands above.

- Due to Windows loopback security features, you may see a warning from your browser when running the test app saying that your connection is not private. Click Advanced -> Continue to localhost to proceed to the app.
