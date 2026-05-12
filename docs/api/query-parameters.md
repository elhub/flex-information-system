# Query Parameters

The API is backed by [PostgREST](https://postgrest.org/). Most query parameters
are forwarded to PostgREST directly; a few are rewritten before
forwarding. This page documents what is available and the syntax to use.

## Filtering — `<field>=<operator>.<value>`

Column filters follow the PostgREST convention:

```http
GET /controllable_unit?status=eq.active
GET /controllable_unit?id=in.(1,2,3)
GET /controllable_unit_service_provider?controllable_unit_id=eq.42
```

Supported operators include `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `like`,
`ilike`, `is`, `in`, `not`, `and`, `or`.  
See the [PostgREST filtering reference](https://postgrest.org/en/latest/references/api/tables_views.html#horizontal-filtering-rows).

## Ordering — `order`

```http
GET /controllable_unit?order=recorded_at.desc
GET /controllable_unit?order=name.asc,id.desc
```

See [PostgREST ordering](https://postgrest.org/en/latest/references/api/tables_views.html#ordering).

## Pagination — `limit` and `offset`

```http
GET /controllable_unit?limit=25&offset=50
```

See [PostgREST pagination](https://postgrest.org/en/latest/references/api/tables_views.html#limits-and-pagination).

## Embedding related resources — `embed`

The `embed` parameter lets you fetch related resources in a single request.
It is a Flex-specific parameter — the proxy rewrites it into a PostgREST
[`select` with resource embedding](https://postgrest.org/en/latest/references/api/resource_embedding.html)
before forwarding.

### Syntax

An embed value is a comma-separated list of relation names. Two optional
modifiers can be appended to each name:

- **`!`** — inner join. Drops parent rows that have no match in the related resource.
- **`(sub-relations)`** —
nest further embeds inside this relation, using the same syntax recursively.

The two modifiers are independent and can be combined in any order:
`relation`, `relation!`, `relation(child)`, `relation!(child(child_of_child))`.

| Example                               | Meaning                                                        |
|---------------------------------------|----------------------------------------------------------------|
| `accounting_point`                    | Embed `accounting_point` (left join)                           |
| `accounting_point!`                   | Embed `accounting_point` (inner join)                          |
| `accounting_point(bidding_zone)`      | Embed `accounting_point`, with `bidding_zone` nested inside it |
| `accounting_point!(bidding_zone)`     | Same, but inner join on `accounting_point`                     |
| `accounting_point,technical_resource` | Embed two relations at the top level                           |

```http
GET /controllable_unit?embed=accounting_point
GET /controllable_unit?embed=accounting_point!
GET /controllable_unit?embed=accounting_point!(bidding_zone,system_operator)
GET /controllable_unit?embed=accounting_point!(bidding_zone!(metering_grid_area))
GET /controllable_unit?embed=accounting_point,technical_resource
```

### Available relations

Available relations are defined per parent resource in [`embed_relations_gen.go`](../../backend/data/embed_relations_gen.go).

For example, on `controllable_unit`:

| Alias              | Actual resource                      |
|--------------------|--------------------------------------|
| `accounting_point` | `accounting_point`                   |
| `service_provider` | `controllable_unit_service_provider` |
| `suspension`       | `controllable_unit_suspension`       |

### Scope enforcement

The proxy checks that the caller's OAuth2 token contains a `read:data:<resource>`
scope for **every** embedded resource. If a required scope is missing the
request fails with `403 Forbidden`.

## Time-range filtering — `valid_at`

`valid_at` is a convenience shorthand for resources with `valid_from` /
`valid_to` columns. The proxy rewrites it to the equivalent PostgREST filter:

```http
valid_from=lte.<value>&or=(valid_to.gt.<value>,valid_to.is.null)
```

```http
GET /controllable_unit_service_provider?valid_at=2025-01-01T00:00:00Z
```

The parameter also works prefixed with a relation name when used alongside
`embed`:

```http
GET /controllable_unit?embed=service_provider&service_provider.valid_at=2025-01-01T00:00:00Z
```

Accepted datetime formats match those described in [API Design — Datetime](../technical/api-design.md#datetime).
An invalid value returns `400 Bad Request`.
