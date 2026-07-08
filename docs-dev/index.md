# Development

The flex project is following a mono-repo style to facilitate fast iterations in
the early phases of the project.

The main purpose of the Flexibility Information System is learning and research
in the interface between the business domain and the technical solution. We are
not currently building for production.

> :warning: While we wait for Elhub's design system to be open-source.
the frontend will not build on external machines.

## Getting started

To get started, you must install a lot of local dependencies. Elhubbers do this
via `devxp-wsl`. We have not yet documented the dependencies for external
users/contributors.

You need to generate certificates for the local development and test
environments. We use
[.flex.internal](https://datatracker.ietf.org/doc/html/draft-davies-internal-tld-02)
as our domain names. Use the following commands.

```bash
~/.ca/issue-cert.sh dev.flex.internal
~/.ca/issue-cert.sh test.flex.internal
~/.ca/issue-cert.sh idp.flex.internal
```

Each of these commands will generate three files in `~/.ca/certificates`. The
paths are hardcoded into the configuration of the local environments. In
addition we are also using the root certificate (at `~/.ca/root/ca.cert.pem`
) to establish trust.

* `<domain>.cert.pem` - The certificate
* `<domain>.fullchain.pem` - The certificate and the CA certificate
* `<domain>.key.pem` - The private key

Then we need to make sure that these domains resolve. Add the following to your
(Windows) hosts file (at C:\Windows\System32\drivers\etc) and restart wsl:

```text
127.0.0.1          dev.flex.internal
::1                dev.flex.internal
127.0.0.1          test.flex.internal
::1                test.flex.internal
127.0.0.1          idp.flex.internal
::1                idp.flex.internal
```

Install and set up project-local dependencies with mise (+ some extras).

```bash
mise trust
mise install
just init
```

Now, you just have to run:

```bash
just reset
```

This will give you a fresh set of containers.

This starts the `test` environment at
[https://test.flex.internal:6443](https://test.flex.internal:6443).

To start the `dev` environment, first stop the backend container with
`docker compose stop backend` and run `just frontend` for frontend and
`just backend` for the backend (in separate terminals). The dev environment is
available at [https://dev.flex.internal:5443](https://dev.flex.internal:5443).

## Code generation

Test code generation with the following commands.

```bash
just permissions
just generate
just openapi
```
