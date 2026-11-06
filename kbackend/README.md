# kbackend

Kotlin/Ktor backend for the Flexibility Information System. This is the primary
backend, intended to replace the existing Go backend. All new features should be
implemented here.

## Code structure

The project is split in several packages corresponding to relatively independent
modules:

| Package  | Purpose                                                                                     |
|----------|---------------------------------------------------------------------------------------------|
| `auth`   | Everything related to authentication: plugins, scopes, and the auth API                     |
| `api`    | Domain logic, DB access and handlers for the data API                                       |
| `jobs`   | Scheduled jobs that run synchronisation processes or regular actions (like sending e-mails) |
| `config` | Ktor application setup                                                                      |
| `shared` | Common code used by several of the packages above                                           |

Code tends to be grouped by resource. Database access is done through
repository classes so as to gather all SQL code related to a resource in only
one place.

### Run modes

The same application image can start in two modes, selected by the `JOB`
environment variable (see `Application.kt`):

- **Normal mode** (`JOB` not set): the Ktor backend starts and serves the data
  and auth APIs.
- **Job mode** (`JOB` set): the backend does **not** start. Only the selected
  job runs, then the process exits.

The value of `JOB` must match the name of a job defined in `jobs/Job.kt`.
Jobs may take their own settings from environment variables.

### Dependency injection

Dependency injection uses [Koin](https://insert-koin.io/) with annotations.
Every package has a module class annotated with `@Module` and `@ComponentScan`
that picks up the annotated classes (e.g. `@Single`) in that package.

`AppModule` is the root of normal mode (`FlexApp`). Each job has its own
`@KoinApplication` so that only the dependencies it needs are started.

## Code generation

### API Models

Models for the APIs are generated from their OpenAPI documents using
[Fabrikt](https://github.com/fabrikt-io/fabrikt). Generated classes should not
be edited by hand.

| API  | Source                             | Package                                  |
|------|------------------------------------|------------------------------------------|
| data | `backend/data/static/openapi.json` | `no.elhub.flex.api.model.dto.generated`  |
| auth | `backend/auth/static/openapi.json` | `no.elhub.flex.auth.model.dto.generated` |

The documents are produced from the files in `openapi/`, so generate them first
(`just openapi` does everything in the right order). To only run the model
generation, which needs Docker:

```bash
scripts/generate-openapi-models.sh
```

### HTTP Clients

Clients for external service integrations are generated using
[Fabrikt](https://github.com/fabrikt-io/fabrikt) via the script
`scripts/generate-openapi-client.sh`. Each integration must have an
`openapi.yaml` file located at:

```bash
src/main/kotlin/no/elhub/flex/shared/<service>/openapi.yaml
```

The generated client is placed in a `generated` subpackage under the same
directory.

Run the script from the repository root, passing the service name as the only
argument:

```bash
scripts/generate-openapi-client.sh adapter
```

This generates a Ktor HTTP client with kotlinx.serialization under:

```bash
src/main/kotlin/no/elhub/flex/shared/adapter/generated/
```
