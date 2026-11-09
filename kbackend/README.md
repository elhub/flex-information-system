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
a scope.

Callers without a token are served as anonymous (scopes `use:auth` and
`read:data`). Routes that require a token say so with `requireScope` or
`requireRoles`, which respond with HTTP 401 when there is none.

### API documentation

Each API serves an Elements page and its OpenAPI document under its own path:

| API  | Documentation page | OpenAPI document            |
|------|--------------------|-----------------------------|
| Data | `GET /api/v1/`     | `GET /api/v1/openapi.json`  |
| Grid | `GET /grid/v0/`    | `GET /grid/v0/openapi.json` |

The documents are bundled at build time from `data/static/openapi.json` and
`grid/static/openapi.json`. The `servers` entry of each is set to
`FLEX_BASE_URL` plus the path of the API, which is the URL its clients use.
