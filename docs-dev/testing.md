# Testing

Our approach to testing will change as the project progresses.
In the beginning we focus more on change than on test.

## API tests

The API is tested in the Kotlin backend (`kbackend`).

### Data API

The data API is tested from the outside, through HTTP calls, by the API tests
in `kbackend/src/apiTest`. They run the data API in-process on top of real
Postgres and PostgREST containers. Each test seeds the data it needs directly in
the database, then calls the API as a party of the relevant role and checks the
responses. This makes it possible to test the endpoints, the validation rules
and the RLS policies for each role.

There is one test class per API resource. Run them with:

```bash
cd kbackend
./gradlew apiTest
```

See the [kbackend README](../kbackend/README.md#api-tests)
for how they work and how to write new ones.

### Authentication API and scopes

The authentication API (`/auth/v1`) is tested in
`kbackend/src/test/kotlin/no/elhub/flex/auth`, covering the token endpoint
(token exchange and JWT bearer grants), assume, userinfo, session and the OIDC
login flow. These tests run the handlers against a real Postgres container.

The scope checks on the data and grid APIs are tested in
`kbackend/src/test/kotlin/no/elhub/flex/api/routes` and
`kbackend/src/test/kotlin/no/elhub/flex/api/postgrest`. These use a mocked
PostgREST and tokens built by the tests, so they do not go through the token
endpoint. Run all of them with:

```bash
cd kbackend
./gradlew test
```

### RLS coverage

The RLS policies in the database come with a `-- RLS: <ID>` comment, and the
API tests include `// RLS: <ID>` comments for the policies they cover.
Run `just coverage` to list which policies are covered by the API tests.

## Event worker

The event worker has no automated tests yet. A list of manual checks can be
found in `test/other_tests/test_event_worker.md`.

## Frontend testing

Frontend tests use Vitest for unit tests and Playwright for end-to-end screenshot
tests. See [Frontend testing](testing-frontend.md) for setup and commands.
