# Dependencies

This page contains some information about how to check/audit dependencies.

## Licences

There is a just recipe to check the licences of all `npm` and `go` dependencies
in the project.

```bash
just vet-licence
```

## Upgrades

### NPM itself

Upgrade with

```bash
npm install -g npm@latest
```

### NPM packages/dependencies

We use both [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit) and
[trivy](https://trivy.dev/latest/) to check for vulnerabilities in our
dependencies. We have found that npm audit does not always find all issues so it
is good practice to use trivy as well. Trivy can be installed via brew.

```bash
npm audit
trivy fs --scanners vuln --include-dev-deps .
```

To do a complete upgrade of all packages we can use
[npm-check-updates](https://www.npmjs.com/package/npm-check-updates).

```bash
npx npm-check-updates --upgrade
npm install
```

### Go version

Check the latest release at the [Go download page](https://go.dev/dl/).

First upgrade your go version using `devxp-wsl`.

Then change the go version in [go.mod](../backend/go.mod) and
[docker-compose.yml](../docker-compose.yml). You can also use
`go get go@latest` for the go.mod one.

### Go dependencies

Checking for vulnerabilities in go dependencies is done by running the
[govulncheck](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck) tool. You
should also
[integrate it into your IDE](https://go.dev/doc/security/vuln/editor).

[This tutorial](https://go.dev/doc/tutorial/govulncheck) is a pretty good guide
on how to use it. The `TL;DR` is:

```bash
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck -show verbose ./...
# handle the output!
```

To check for packages that have new versions use:

```bash
go list -m -u all | grep '\['
```

To upgrade all dependencies to the latest version use:

```bash
go get -u -t ./...
go mod tidy
```

Then maybe rerun govulncheck 😉?
