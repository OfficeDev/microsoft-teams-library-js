# Bundle analysis app

This is an app which contains minimal code for just using the _teams-js_ package and is responsible for monitoring the size of it. It's configured with webpack to output zipped webpack stats which is being used for comparing the size of app across different commits/changes. This webpack stats contains the size of the bundle along with its dependencies.

## Generating bundle analysis

```
pnpm webpack:profile
```

## Building project

```
pnpm build
```
