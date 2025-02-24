# Development

The flex project is following a mono-repo style to facilitate fast iterations in
the early phases of the project.

The main purpose of the Flexibility Information System is learning and research
in the interface between the business domain and the technical solution. We are
not currently building for production.

## Getting started

To get started, you must install a lot of local dependencies. Elhubbers do this
via `devxp-wsl`. We have not yet documented the dependencies for external
users/contributors.

Some additional tools are required:

```bash
# golangci-lint is used to lint go code
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
# go-licenses is used to vet go licenses
go install github.com/google/go-licenses@latest
#  govulncheck is used to check for vulnerabilities in go dependencies
go install golang.org/x/vuln/cmd/govulncheck@latest
# stringer is used to generate string methods for enums
go install golang.org/x/tools/cmd/stringer@latest
# enumer is similar to stringer, but generates string to enum-method as well
go install github.com/PotatoesFall/enumer@latest
# air is used to hot reload the go backend
go install github.com/air-verse/air@latest
```

```bash
brew install pandoc
brew install ruff
brew install sqlc
```

We also need to generate certificates for the local development and test
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
(Windows) hosts file:

```text
127.0.0.1          dev.flex.internal
::1                dev.flex.internal
127.0.0.1          test.flex.internal
::1                test.flex.internal
127.0.0.1          idp.flex.internal
::1                idp.flex.internal
```

Then you can start the Python virtual environment with `just _venv`. You should
now be able to run the project, after having generated all the files through
the scripts, with the following commands:

```bash
just permissions
just openapi
just test-accounts
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
