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
```

```bash
brew install pandoc
brew install ruff
brew install sqlc
```

We also need to generate a certificate for the local development environment `flex.localhost`.

```bash
~/.ca/issue-cert.sh flex.localhost
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

You can then access the different resources at:

* [https://flex.localhost:6443](https://flex.localhost:6443) - Portal, API and docs
* [http://localhost:3000](http://localhost:3000) - postgREST API
* [http://localhost:3001](http://localhost:3001) - Swagger UI for PostgREST API
