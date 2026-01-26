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

## Running with HTTPS

The SSR Test App uses HTTP by default. To run it in the Orange app, you'll need HTTPS.

**Two options:**

- **Option 1:** Generate local SSL certificates (recommended for development)
- **Option 2:** Use ngrok (no certificates needed, but URLs change between runs on free tier)

### Option 1: Using the Custom HTTPS Server

1. Generate SSL certificates:

**Automated (Recommended):**

```bash
# From the monorepo root
pnpm setup-ssr-app-cert
```

This script will:

- Check if mkcert is installed (prompts to install if missing)
- Install the local CA
- Generate certificates in `apps/ssr-test-app/certs/`

**Manual:**

```bash
# Install mkcert (if not already installed)
brew install mkcert  # macOS
# or follow instructions at https://github.com/FiloSottile/mkcert

# Install the local CA
mkcert -install

# Generate certificates in the certificates directory
cd apps/ssr-test-app/certificates
mkcert localhost
# This creates localhost.pem and localhost-key.pem
```

2. Run the app with HTTPS:

```bash
# From monorepo root
pnpm start-ssr-app:https

# Or from the ssr-test-app directory
pnpm dev:https   # for development
# or
pnpm start:https # for production (requires pnpm build first)
```

The app will be available at https://localhost:3000

### Option 2: Using ngrok

Alternatively, ngrok can be used to generate a secure https connection without the need to generate an SSL certificate:

```bash
# In one terminal, start the app normally
pnpm dev

# In another terminal, start ngrok
ngrok http 3000
```

# Troubleshooting

If your build is succeeding locally, however is failing in the PR, it is possible your local version is building the SSR Test App with a cached version of teams-js without the breaking changes. If this is the case,
simply delete your node_modules folder in the ssr-test-app directory, then redo the pnpm commmands above.
