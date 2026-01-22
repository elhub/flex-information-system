# How to interact with the FIS as an API user

This is a guide to get you started as a service provider that will mainly
interact with the FIS through the API.

!!! info "Guide for portal users"
    If you rather would like to use the portal, please head to the
    [getting started guide for the portal users](TODO).

## Understand the model

The first step is to read and understand our [authentication model](./authn-model.md).
Indeed, in order to be able to manually use the API, you need to understand what
an _entity_ and a _party_ are and how they make up the identity of a user in the
system.

You also need to understand [_scopes_](./authz-model.md#scopes) and how they allow
restricting what operations an API user can do.

Finally, you need to understand what an [_entity client_](../../resources/entity_client.md)
is, because it is the main tool we use to allow machine access to the API.

## Objects initially created by the FIS operator

As part of the [SP registration and approval process](../../processes/service-provider-registration-and-approval.md),
you need to be in contact with a FIS operator that will create objects you need
to be able to log in to the system.
The created objects are explained in the [user management documentation](./users-management.md).

More precisely, objects related to the organisation correspond to step 12 in the
sequence diagram of the process, the FISO activates the parties as part of step
14, and your personal entity is created in step 16.

To be able to show examples below, let us assume the following entities and
parties got created by the FISO:

| Entity ID | Entity name   | Entity type  | Entity business ID    | Entity business ID type |
|-----------|---------------|--------------|-----------------------|-------------------------|
| 492       | Testkraft AS  | Organisation | 123456789             | Organisation number     |
| 507       | Kari Nordmann | Person       | `knor@testkraft.test` | E-mail                  |

| Party ID | Party name    | Party type       | Party business ID  | Party business ID type | Owning entity |
|----------|---------------|------------------|--------------------|------------------------|---------------|
| 1394     | Testkraft ORG | Organisation     | 123456789          | Organisation number    | Testkraft AS  |
| 1482     | Testkraft SP  | Service provider | 1111111111111      | GLN                    | Testkraft AS  |

## Log in to the portal and create entity clients

Connect to the portal as your personal entity, with the credentials you have got
from the FIS operator.
You should be able to assume the organisation party.

Now, navigate to the page of your company's entity and add an entity client.
A cryptographic key should be generated for each client as explained in the
documentation of the [JWT Bearer](./authn-methods.md#jwt-bearer) authentication
method.
You can set up scopes to restrict what the person using machine access will be
able to do on the API.

Let us assume you set up one entity client.

Let us say you created the following entity client to enable machine access as
the service provider party, with maximal scopes (no restrictions):

| Client name | Client ID                            | Party        | Scopes                       |
|-------------|--------------------------------------|--------------|------------------------------|
| PC #1       | 7a9016dc-ac40-4908-9462-ffb0809726ce | Testkraft SP | `manage:auth`, `manage:data` |

## Log in to the API with the machine

From now on, we will only interact with the FIS through the API.
To log in, we need to tell which client we are using and which party we want to
assume.
In the following example Python script, we forge a JWT token with the relevant
information and send a JWT Bearer login request:

```python
import os
import requests
from datetime import datetime as dt, timezone as tz, timedelta
import uuid
import jwt

auth_api_url = # ... URL to the auth API (e.g., https://api.url/auth/v0)
key          = # ... private key associated to the PC #1 entity client

# JWT token contents
payload = {
  "aud": auth_api_url,
  "iss": "7a9016dc-ac40-4908-9462-ffb0809726ce", # client ID for PC #1
  "jti": str(uuid.uuid4()),
  "sub": f"no:party:gln:1111111111111", # GLN of Testkraft SP
  "iat": dt.now(tz.utc),
  "exp": dt.now(tz.utc) + timedelta(seconds=120),
}

# sign the token
token = jwt.encode(payload, key, algorithm="RS256")

# send the login request
response = requests.post(
  auth_api_url + "/token",
  headers={"Content-Type": "application/x-www-form-urlencoded"},
  data={
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "assertion": token,
  },
)
```

A successful response should look like the following:

```json
{
  "access_token": "eyJhb...fG-3SD21", // truncated for readability
  "expires_in": 3600,
  "issued_token_type": "urn:ietf:params:oauth:token-type:jwt",
  "token_type": "Bearer"
}
```

The value extracted from the `access_token` field is a valid JWT token you can
now use for accessing the data API like it is done behind the scenes when you
are using the portal.
If you decode the token, you will be able to see the following information:

```json
{
  // example values
  "exp": 2284312075,
  "eid": "ca2be316-5622-474d-8ef4-5c69850be76d",

  // user logged in as Testkraft AS
  "entity_id": 492,
  // acting on behalf of Testkraft SP
  "party_id": 1482,
  // as a service provider
  "role": "flex_service_provider",
  // with full access rights
  "scope": "manage:auth manage:data"
}
```

This can be checked with a call to the `userinfo` endpoint:

```python
response = requests.get(
  auth_api_url + "/userinfo",
  headers={"Authorization": f"Bearer {user_token}"},
)
```

The response will contain the following body:

```json
{
  "current_role": "flex_service_provider",
  "entity_id": 492,
  "entity_name": "Testkraft AS",
  "party_id": 1482,
  "party_name": "Testkraft SP",
  "sub": 334
}
```

Now, you can freely use the data API:

```python
response = requests.get(
  data_api_url + "/party/1482",
  headers={"Authorization": f"Bearer {user_token}"},
)
```

```json
{
  "id": 1482,
  "name": "Testkraft SP",
  "business_id": "1111111111111",
  "business_id_type": "gln",
  "entity_id": 492,
  "type": "service_provider",
  "role": "flex_service_provider",
  "status": "active",
  "recorded_at": "2023-12-31 00:00:00 Europe/Oslo",
  "recorded_by": 0
}
```
