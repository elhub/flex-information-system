# API versioning

This document explains our approach towards changes in our API.

## Stability

We work in a dynamic way and regularly introduce changes in our system, but we
consider the API to be a _contract_ that we take responsibility for not
breaking. We strive therefore to provide a _stable_ API specification. This
allows our users to build reliable integrations against our API and have more
time to gradually acknowledge and support new features.

## Breaking changes

Even though stability is one of our main goals, we know that _breaking_ the API
is _always needed_ at some point. In order to keep a stable API while allowing
ourselves to introduce breaking changes, we introduced two mechanisms: path
versioning and rolling versions.

### Path versioning (major changes)

This consists in including a version segment (_e.g._, `/v1/`) in all URLs of the
API. Incrementing this API version conceptually means using a substantially
different API. We expect very few such changes, only after major API reworks on
the long run.

As this API was started in the context of a fast-moving research project, we
learnt a lot while building it. As the system is used, we will progressively get
more insights into its limitations and have all the ingredients in our control
to build a general `/v2/`. The timeline for such a change will be communicated
well in advance, and users will be able to run major versions in parallel for a
period.

!!! example

    Major logical changes, like several resources becoming related in different
    ways than before, or time-dependent information being stored in completely
    different resources, require substantial logic to be _translated_ to the old
    concepts implemented in the existing API.

    Any such changes requiring an advanced "bridge" between the old and new
    logic would belong to a major version bump.

### Rolling versions (minor changes)

Path versioning is a rather heavy change management strategy, as it forces us to
handle a new set of endpoints everytime we update the major version, and set up
translation mechanisms so that we do not repeat ourselves. Therefore, a major
version should only be released once a critical amount of required changes is
reached.

Smaller changes can still be needed without requiring a bump to the major
version. In such cases, we introduce them _within the lifetime_ of the active
version of the API, by pinning them to a _date_. Our endpoints then _require_ an
`Api-Version` header in a _date format_ to navigate between all small changes
introduced since the last major version of the API. This is called
[rolling versions](https://www.getconvoy.io/blog/rolling-versions) and allows
clients to progressively move to newer versions of the API at their own pace.

We expect everyone to move to the latest versions of the API eventually. The
exact schedule for removing older minor versions will be communicated explicitly
for each version.

!!! example

    For instance, moving a field from a resource to one of its subresources can
    be considered as a minor change, as it does not fundamentally break the
    logic of the existing API.
    
    Indeed, after having implemented the change in our data layout and added the
    field to the subresource in the new minor version, support for the old minor
    version can always be implemented by fetching the field from the subresource
    and exposing it in the main resource.

## Non-breaking changes

There are also other kinds of changes we allow ourselves doing on the API
_without considering them to be breaking changes_. As a rule of thumb, any
_addition_ to the specification is not considered to be breaking the API. For
instance, we take freedom to _add new fields_ to resources or specify fields
that are currently left as a general `object`.

## Documentation

API documentation pages are available at `https://<hostname>/<api>/<version>`,
for instance the
[data API in the test environment](https://flex-test.elhub.no/api/v1/).

Developers can also track actual changes in the API by checking whether the
OpenAPI specification files on our open source repository have been updated:

* [Data API specification](https://github.com/elhub/flex-information-system/blob/main/backend/data/static/openapi.json)
* [Auth API specification](https://github.com/elhub/flex-information-system/blob/main/backend/auth/static/openapi.json)
* [Grid API specification](https://github.com/elhub/flex-information-system/blob/main/backend/grid/static/openapi.json)
