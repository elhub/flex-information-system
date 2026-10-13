# flex-admin

This is a prototype front-end for the Flexibility Information System.
At this stage of the project, the front-end should be as simple as possible,
and rely mainly on automated tools, so that we can explore simple functional
scenarios and make our specification evolve without getting lost in
front-end-specific implementation details.
We therefore rely on [React-Admin](https://marmelab.com/react-admin/) for now.

## Installation

Install the application dependencies by running:

```sh
npm install
```

## Development

Start the application in development mode by running:

```sh
npm run dev
```

## Production

Build the application in production mode by running:

```sh
npm run build
```

## End-to-end visual regression tests

The Playwright suite provides focused visual regression checks for frontend
components, currently centered on the shared `ResourceShowLayout`. See the
[frontend testing guide](../docs-dev/testing-frontend.md) for scope, setup, run
instructions, and snapshot updates.
