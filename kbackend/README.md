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

| API  | Source                              | Package                                  |
|------|-------------------------------------|------------------------------------------|
| data | `kbackend/data/static/openapi.json` | `no.elhub.flex.api.model.dto.generated`  |
| auth | `backend/auth/static/openapi.json`  | `no.elhub.flex.auth.model.dto.generated` |

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

### PostgREST routes

The data and grid APIs are served by [PostgREST](https://postgrest.org/), with
kbackend in front of it. The routes are generated from the OpenAPI documents by
`local/scripts/openapi_to_kbackend_routes.py` (part of `just openapi`) into
`GeneratedDataApiRoutes` and `GeneratedGridApiRoutes`. The files only contain
data: every route of the document and the embed relations.

Each request is checked against the scopes of the caller and rewritten for
PostgREST: `/<resource>/<id>` becomes a filter, `embed` becomes `select`, and
`valid_at` and `as_of` become filters.

Authentication failures follow
[RFC 6750](https://www.rfc-editor.org/rfc/rfc6750):
HTTP 401 with `WWW-Authenticate: Bearer` for a missing token, HTTP 401 with
`error="invalid_token"` for an invalid or expired one, and HTTP 403 with
`error="insufficient_scope"` (naming the required scope) when the token lacks
a scope. All routes are declared with `authenticatedRouting` and restricted with
`requireScope` or `requireRoles`; they respond with HTTP 401 when there is no
token. An `Authorization` header that is not a `Bearer` header is rejected with
HTTP 400.

### API documentation

Each API serves an Elements page and its OpenAPI document under its own path:

| API  | Documentation page | OpenAPI document            |
|------|--------------------|-----------------------------|
| Data | `GET /api/v1/`     | `GET /api/v1/openapi.json`  |
| Grid | `GET /grid/v0/`    | `GET /grid/v0/openapi.json` |

The documents are bundled at build time from `data/static/openapi.json` and
`grid/static/openapi.json`. The `servers` entry of each is set to
`FLEX_BASE_URL` plus the path of the API, which is the URL its clients use.
