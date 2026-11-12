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

## Testing

### Unit and repository tests

```bash
./gradlew test
```

Repository and job tests use Testcontainers for Postgres, so Docker must be
running. They seed their own data (see `testutil/TestData.kt`).

### API tests

The API tests run the data API in-process on top of real Postgres and
[PostgREST](https://postgrest.org/) containers. They replace the Python tests
in `test/api_client_tests`, one resource at a time, with the same scenarios.

```bash
./gradlew apiTest
```

Docker must be running. The first run pulls `postgrest/postgrest`.

Run a single class or test:

```bash
./gradlew apiTest --tests 'no.elhub.flex.api.producttype.ProductTypeApiTest'
```

`./gradlew check` runs both `test` and `apiTest`. In CI the API tests run as a
separate "API tests" step of the kbackend build.

#### How they work

- The tests live in the `apiTest` source set (`src/apiTest`) and can use the
  classes from `src/test`, such as `PostgresTestContainer` and `makeJwt`.
- `PostgresTestContainer` applies the Liquibase migrations once per run.
  `PostgrestTestContainer` starts PostgREST on top of it with the same settings
  as `docker-compose.yml`.
- `apiTestApplication()` starts the backend's data routes in-process
- The tests run one after another against the same database.

#### Writing a test

- One class per API resource, named `<Resource>ApiTest`. Extend `ApiSpec`,
  which starts the application and gives the test an `api` client, for example
  `api.get("/party", actor.token())`.
- Seed an actor with `insertActor(TestPartyRole.SO)` (a party of that role, and
  a person who has assumed it and is a member of it) or `insertEntityActor()`
  (an entity that has not assumed a party). `actor.token(scope)` gives a token
  that makes the call act as that actor; the test chooses the scope.
- Each test seeds the data it needs with `seed { ... }`. Generic helpers belong
  in `SeedScope` (`testutil/TestData.kt`) so other classes can reuse them;
  helpers that only one class needs stay in that class.
- Truncate the tables the class touches in `beforeEach`, for example
  `beforeEach { truncate("flex.product_type", "flex.party", "flex.entity") }`.
  `CASCADE` also clears the tables that reference them. Seed inside the test or
  in `beforeEach`
- Use `// RLS: <ID>` comments so the tests can be matched against the RLS
policies they cover.
- Assert the exact status code of every response, also for denied calls. Two
  codes are quirks of PostgREST that the tests pin on purpose, see
  `HIDDEN_BY_RLS` (406 for a row that row level security hides) and
  `MUTATION_DENIED_BY_RLS` (401 for a PATCH or DELETE it denies on
  `entity_client`).
