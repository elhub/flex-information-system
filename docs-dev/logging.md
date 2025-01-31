# Logging

This document describes our logging strategy in different part of the system.

## Backend - Go

We are using the [fairly recent](https://go.dev/blog/slog) package
[slog](https://pkg.go.dev/log/slog) for logging. We are currently experimenting
with formatting and structure, so this document will be updated as we go and a
standard emerges. We should actively consider to add our own logging package or
interface to bake in the practices we want to follow.

Use of logging library is enforced via the `golangci-lint` config.

### Use context

We should always log with context. This is future-proofing our logging in case
we want to pull out different things from the context as part of logs. Examples
are trace IDs or current user.

This means: Use `slog.InfoContext()` instead of `slog.Info()` and pass the context.

### Levels

There are four levels available in `slog`. We log everything except `Debug` in
production.

- `Debug` - For developers to trace and debug the code when testing or
  reproducing issues locally.
- `Info` - For general information about goings on in the system. We should log
  enough to be able to trace flow, provide metrics and dig into issues on production.
- `Warn` - For non-critical issues that does not impact the business or
  operation of the system. Warnings should be checked on a regular basis but not
  alerted on. Examples: HTTP request or worker failed but we have a retries, some
  non-critical timeout
- `Error` - For critical issues that need attention. Something that should not
  happen in the system. Errors should be alerted on. Example: a worker died

Even though the slog package gives us the flexibility to add additional log
levels, these four provide enough granularity for our needs. In fact,
[even two levels would be enough](https://dave.cheney.net/2015/11/05/lets-talk-about-logging)
😉.
