# kbackend

Kotlin/Ktor backend for the Flexibility Information System. This is the primary
backend, intended to replace the existing Go backend. All new features should be
implemented here.

## Code generation

### API Models

Models for the API are generated from `openapi.yaml` at the module
root using [Fabrikt](https://github.com/fabrikt-io/fabrikt). Generated classes
are placed under the `no.elhub.flex.model.dto.generated` package and should not
be edited by hand. To run the script:

```bash
scripts/generate-openapi-models.sh
```

### HTTP Clients

Clients for external service integrations are generated using
[Fabrikt](https://github.com/fabrikt-io/fabrikt) via the script
`scripts/generate-openapi-client.sh`. Each integration must have an
`openapi.yaml` file located at:

```bash
src/main/kotlin/no/elhub/flex/integration/<service>/openapi.yaml
```

The generated client is placed in a `generated` subpackage under the same
directory.

Run the script from the repository root, passing the service name as the only
argument:

```bash
scripts/generate-openapi-client.sh accountingpointadapter
```

This generates a Ktor HTTP client with kotlinx.serialization under:

```bash
src/main/kotlin/no/elhub/flex/integration/accountingpointadapter/generated/
```
