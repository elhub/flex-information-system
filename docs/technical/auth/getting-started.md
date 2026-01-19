# Register your first controllable unit as an API user

This is a guide to get you started as a service provider that will mainly
interact with the FIS through the API.

!!! info "Guide for portal users"
    If you rather would like to use the portal, please head to the
    [getting started guide for the portal users](TODO).

## Get the right entities and parties created by FISO

For this first step, you just have to take contact with a FIS operator to get
the following objects created in the FIS for you:

* the entity that corresponds to your organisation,
* the service provider party you will assume to register technical information
  on behalf of the organisation,
* the organisation party that will allow administrating user access related to
  the previous entity,
* your personal entity as well as an associated user in the identity provider,
  so you can log in as yourself in the portal,
* a party membership relation to make your personal entity a member of the
  organisation party and thereby grant you administrative rights on user
  access configuration.

Note that these objects are the building bricks of our
[authentication model](./auth-model.md).

Objects related to the organisation corresponds to step 12 in the sequence
diagram of the
[SP registration and approval process](../../processes/service-provider-registration-and-approval.md).
The FISO will need to activate the parties as part of step 14 and create your
personal entity as step 16.

For the example's sake, let us assume the following entities and parties got
created by the FISO:

| Entity name   | Entity type  | Entity business ID    |
|---------------|--------------|-----------------------|
| Testkraft AS  | Organisation | 123456789             |
| Kari Nordmann | Person       | `knor@testkraft.test` |

| Party name    | Party type       | Party business ID  | Owning entity |
|---------------|------------------|--------------------|---------------|
| Testkraft ORG | Organisation     | 123456789          | Testkraft AS  |
| Testkraft SP  | Service provider | 1111111111111      | Testkraft AS  |

!!! note
    123456789 is an example organisation number and 1111111111111 is a GLN.

## Log in to the portal and create entity clients

Connect to the portal as your personal entity, with the credentials you have got
from the FIS operator. You should be able to assume the organisation party.

Now, navigate to the page of your company's entity and add as many entity
clients as you need. A cryptographic key should be generated for each client as
explained in the documentation of the [JWT Bearer](./auth-methods.md#jwt-bearer)
authentication method. You can set up scopes to restrict what users can do with
API access.

Let us assume you set up one entity client, in order to grant API access to one
machine to the service provider party:

| Client name | Client ID                            | Party        | Scopes                       |
|-------------|--------------------------------------|--------------|------------------------------|
| PC #1       | 7a9016dc-ac40-4908-9462-ffb0809726ce | Testkraft SP | `manage:auth`, `manage:data` |

## Start machine access to the API

From now on, we will only interact with the FIS through the API.
To log in, we need to tell which client we are using and which party we want to
assume.
We forge a JWT token with the following information:

```json
{
  "aud": "https://$API_URL/auth/v0",
  "exp": "$(NOW + 1 minute)",
  "iat": "$NOW",
  "iss": "7a9016dc-ac40-4908-9462-ffb0809726ce",
  "jti": "37db1b9b-82bb-446d-9bdf-7a13194b2e67",
  "sub": "no:party:gln:11111111111"
}
```

!!! note
    `$API_URL` must be replaced by the URL of the API to the FIS, and `iss` must
    be the client ID of the entity client created in the previous section.
    `iat` must contain the current timestamp and `exp` another timestamp no more
    than 2 minutes later. `jti` is another UUID generated to identify the token.
    We also specify that we want to assume the Testkraft SP party by giving its
    GLN identifier.

Now, we just have to fire a `POST` request to the `/auth/v0/token` endpoint with
the following header:

```text
Content-Type: application/x-www-form-urlencoded
```

as well as the following body, where `$JWT` is replaced with the encoded version
of the JWT token forged above:

```text
grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$JWT
```

## Create a controllable unit

Now, you can use the JWT token returned by the API as bearer authentication in
all your subsequent calls to the data API, for example to create a controllable
unit.
