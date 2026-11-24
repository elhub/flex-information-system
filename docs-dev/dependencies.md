# Dependencies

This page contains some information about how to check/audit dependencies.

## Licences

There is a just recipe to check the licences of all `npm` dependencies
in the project.

```bash
just vet-license
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
# for all dependencies
npx npm-check-updates --upgrade
# for devDependencies only
npx npm-check-updates --upgrade --dep dev
npm install
```

### Python

Python is handled via mise and uv. Requirements are specified in
[pyproject.toml](../pyproject.toml). Versions are managed in
[uv.lock](../uv.lock). To upgrade python dependencies, use the following commands:

```bash
# upgrade all dependencies to the latest version
uv lock --upgrade
# sync the virtual environment
uv sync
```
