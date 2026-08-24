# Changelog

This changelog tracks all changes that are visible in our API.

## API change principles

Since our system is now deployed and has users, our strategy shifts towards more
stability. We still work in a dynamic way and regularly introduce changes in the
system, but the API is a _contract_ that we take responsibility in not breaking,
so that user integrations continue working.

In order to still be able to _break_ the API, as it will be needed in the
future, we introduced two mechanisms:

* We use API _versions_ in the URLs. This means that paths in the API include a
  version segment (_e.g._, `/v1/`). Incrementing this API version conceptually
  means using a substantially different API. We expect very few such changes,
  only after major API reworks on the long run.
  
* We _require_ an `Api-Version` header in a _date format_, to allow navigating
  between smaller changes we potentially introduce within the lifecycle of a
  given major version of the API.

There are also other kinds of changes we allow ourselves doing on the API
_without considering them to be breaking changes_. As a rule of thumb, any
_addition_ to the specification is not considered to be breaking the API. For
instance, we take freedom to _add new fields_ to resources or specify fields
that are currently left as a general `object`.

API documentation pages are available at `https://<hostname>/<api>/<version>`,
for instance the
[data API in the test environment](https://flex-test.elhub.no/api/v1/).

Developers can also track actual changes in the API by checking whether the
OpenAPI specification files on our open source repository have been updated:

* [Data API specification](https://github.com/elhub/flex-information-system/blob/main/backend/data/static/openapi.json)
* [Auth API specification](https://github.com/elhub/flex-information-system/blob/main/backend/auth/static/openapi.json)
* [Grid API specification](https://github.com/elhub/flex-information-system/blob/main/backend/grid/static/openapi.json)

## Registered API changes

<!-- markdownlint-disable MD013 -->
### 2026-06-08 · Initial release

* **Initial public release of the Flexibility Information System API.**
  All endpoints are available under `Api-Version: 2026-06-08`.
