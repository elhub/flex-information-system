# kbackend

Kotlin/Ktor backend for the Flexibility Information System. This is the primary
backend, intended to replace the existing Go backend. All new features should be
implemented here.

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
