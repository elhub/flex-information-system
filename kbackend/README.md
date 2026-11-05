# kbackend

Kotlin/Ktor backend for the Flexibility Information System. This is the primary
backend, intended to replace the existing Go backend. All new features should be
implemented here.

## Code generation

### API Models

Models for the API are generated from `openapi.yaml` at the module
root using [Fabrikt](https://github.com/fabrikt-io/fabrikt). Generated classes
are placed under the `no.elhub.flex.api.model.dto.generated` package and
should not be edited by hand. To run the script:

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
`read:data`). Routes that require a token say so with `requireScope` or
`requireRoles`, which respond with HTTP 401 when there is none.

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
