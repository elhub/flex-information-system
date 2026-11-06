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

### Data API route table

Most of the data API is served by [PostgREST](https://postgrest.org/), with
kbackend in front of it. The routes are generated from the OpenAPI document by
`local/scripts/openapi_to_kbackend_routes.py` (part of `just openapi`) into
`no.elhub.flex.api.routes.data.generated.GeneratedDataApiRoutes`. The file
only contains data: every route of the document and the embed relations.

How each route is served is decided in `DataApiRegistry`:

- **PostgREST** (the default): `buildPostgrestRequest` checks the scope and
  rewrites the request for PostgREST (`/<resource>/<id>` to a filter, `embed`
  to `select`, `valid_at`/`as_of` to filters).
- **variants**: served by PostgREST with a deviation, e.g. `GET /event` and
  attachment reads.
- **native**: implemented in kbackend itself, e.g. `POST /entity/lookup`.
- **not exposed**: in the OpenAPI document but not served.

`RouteTableTest` fails if the generated table, the OpenAPI document and the
registry disagree. To add a route, add it to `resources.yml` and run
`just openapi`; it is then served by PostgREST unless you register it
otherwise.

Authentication failures follow
[RFC 6750](https://www.rfc-editor.org/rfc/rfc6750):
HTTP 401 with `WWW-Authenticate: Bearer` for a missing token, HTTP 401 with
`error="invalid_token"` for an invalid or expired one, and HTTP 403 with
`error="insufficient_scope"` (naming the required scope) when the token lacks
a scope.

Callers without a token are served as anonymous (scopes `use:auth` and
`read:data`). Data API routes are declared with `optionalAuthenticatedRouting`,
which lets callers without a token through but still rejects an invalid one.
Routes that require a token are declared with `authenticatedRouting` and
restricted with `requireScope` or `requireRoles`; they respond with HTTP 401
when there is none. An `Authorization` header that is not a `Bearer` header is
rejected with HTTP 400.

PostgREST is reached at `FLEX_POSTGREST_URL`.

### Data API documentation

`GET /` serves an Elements page and `GET /openapi.json` the OpenAPI document,
which is bundled from `data/static/openapi.json` at build time. The `servers`
entry of the document is set to `FLEX_BASE_URL` plus `DATA_API_MOUNT_PATH`
(`/api/v1`), the path the API is reached under by its clients.

`DATA_API_MOUNT_PATH` is the only place in kbackend that knows the mount path.
The routes are served without it as long as the Go backend strips it before
forwarding. When the Go backend is removed, the routes are mounted under this
path.
