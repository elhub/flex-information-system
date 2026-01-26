# Tooling

This document describes some of the tools at play in the project.

| Tool                                  | Description                                                                   |
|---------------------------------------|-------------------------------------------------------------------------------|
| [pre-commit](https://pre-commit.com/) | A framework for managing and maintaining multi-language pre-commit hooks.     |
| [just](https://github.com/casey/just) | Command runner used as a handy way to save and run project-specific commands. |

## Formatting and linting with VSCode and pre-commit

To install the pre-commit hooks, run the following command:

```bash
pre-commit install
```

This project used [pre-commit](https://pre-commit.com/) to run formatting and
linting checks before every commit. Visual Studio Code is the preferred editor.
So we are aiming to provide a conflict-free setup between VSCode and pre-commit.

### File extensions

`pre-commit` is configured to error when it encounters files with new
extensions. To allow a new file type in this repository, the file type must be
allow-listed in `.pre-commit`. Before doing that, proper formatter and linters
should be configured in pre-commit and described here. Look at
[pre-commit.com/hooks.html](https://pre-commit.com/hooks.html) (+ Google) for
available hooks.

### Markdown

We are relying on the markdown linting tools made by David Anson.

* cli - [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
* VSCode extension - [DavidAnson.vscode-markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

To make life easier in VSCode, consider installing the following extensions:

* [marvhen.reflow-markdown](https://marketplace.visualstudio.com/items?itemName=marvhen.reflow-markdown)
* [saeris.markdown-github-alerts](https://marketplace.visualstudio.com/items?itemName=saeris.markdown-github-alerts)
* [yzhang.markdown-all-in-one](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)

### SQL

We are using the [SQLFluff](https://docs.sqlfluff.com/en/stable/) linter and
formatter for SQL. We considered using pgFormatter, but SQLFluff has a simpler
setup and story for pre-commit + VSCode.

In addition, we are running [squawk](https://github.com/sbdchd/squawk) on all
migrations.

VSCode extension:

* [dorzey.vscode-sqlfluff](https://marketplace.visualstudio.com/items?itemName=dorzey.vscode-sqlfluff)

### Yaml

We are using `yamllint` and the default pre-commit hooks for yaml.

In VSCode, consider installing

* [redhat.vscode-yaml](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)

### Bash

[ShellCheck](https://github.com/koalaman/shellcheck) and
[shfmt](https://github.com/mvdan/sh) are our tools for linting and formatting bash
scripts.

There are also extensions for VSCode:

* [timonwong.shellcheck](https://marketplace.visualstudio.com/items?itemName=timonwong.shellcheck)
* [mkhl.shfmt](https://marketplace.visualstudio.com/items?itemName=mkhl.shellcheck)

### PlantUML

We don't have any specific linters or formatters enabled.

In VSCode, consider installing

* [jebbs.plantuml](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

### OpenAPI documents

We rely on [spectral](https://github.com/stoplightio/spectral). `pre-commit` is
configured to run a locally installed spectral binary. Follow the
[install docs](https://github.com/stoplightio/spectral?tab=readme-ov-file#-installation)
to install via npm.

In VSCode, consider installing

* [stoplight.spectral](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral)

### Go

We rely on [golangci-lint](https://golangci-lint.run/) for linting Go code. It
combines most of the linters in the ecosystem and provides powerful
configuration and handling of false positives. We also run some of the commands
in the `go` toolchain.

Our `pre-commit` hooks local configurations since we have our go code in a
sub-directory. We could not get the default hooks working.

In VSCode, consider installing

* [golang.go](https://marketplace.visualstudio.com/items?itemName=golang.Go)
* configure [golangci-lint as the lintTool in settings](https://golangci-lint.run/welcome/integrations/)
