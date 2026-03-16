# kbackend

Kotlin/Ktor backend for the Flexibility Information System. This is the primary
backend, intended to replace the existing Go backend. All new features should be
implemented here.

## Code generation

Clients for external service integrations are generated using
[Fabrikt](https://github.com/fabrikt-io/fabrikt) via the script
`scripts/generate-openapi-client.sh`. Each integration must have an
`openapi.yaml` file located at:

```
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

```
src/main/kotlin/no/elhub/flex/integration/accountingpointadapter/generated/
```
