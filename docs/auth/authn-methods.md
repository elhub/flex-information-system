# Authentication methods

Authentication is the process of establishing the "raw" identity of the user.
For us, this means identifying the _entity_, i.e. the individual or organisation
using the system. We provide different ways of authentication, depending on how
you want to interact with the system.

Individuals what want to log into the portal will log in using the
`OpenID Connect` protocol with an identity provider. In a production setting the
identity provider will be IDPorten.

Entities that want to use the API will have to create and attach clients to
their entity resource in the system. Creating a client generates a unique
identifier and allows setting a password and/or a public key associated to this
client. From there, users have two ways of authenticating.

* `JWT Bearer` - The entity uploads a public key to one of its clients and uses
  a self-signed JWT Authorization grant to authenticate.

!!! note "Possible future use of enterprise certificates"

    We are considering the use of enterprise certificates and/or Maskinporten in
    a production setting.

## OpenID Connect

A regular user in the portal will be authenticated via a OpenID Connect
compatible provider. We believe that IDPorten is the most likely candidate for a
production system. In test we are using Oracle Cloud Identity and
Access Management (IAM).

The OpenID connect flow is based on redirects between the portal and the Idenity
provider, and as part of the process, the Flexibility Information System will
obtain the identity of the user from the Identity provider and issue an access
token for the portal.

## JWT Bearer

This is the preferred method for authenticating towards the API. The method
uses
[JWTs as authorization grants](https://datatracker.ietf.org/doc/html/rfc7523#section-2.1)
as defined by RFC7523. This the same method as [used by Maskinporten](https://docs.digdir.no/docs/Maskinporten/maskinporten_auth_server-to-server-oauth2).

To authenticate, the client must send a request with `Content-Type` header as
`application/x-www-form-urlencoded` and a body similar to the following:

```text
grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=<authorization grant JWT>
```

The magic is in the assertion JWT. Use the following payload.

| Claim | Name            | Description                                                                                                                                                                                                                                                                                                                                                                                   | Example                                       |
|-------|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `aud` | Audience        | The URL of the token endpoint.                                                                                                                                                                                                                                                                                                                                                                | `https://flex-test.elhub.no/auth/v1/`         |
| `exp` | Expiration Time | The expiration time of the JWT. Maximum 120 seconds after `iat`.                                                                                                                                                                                                                                                                                                                              |                                               |
| `iat` | Issued At       | The time the JWT was issued. Only tokens with `iat` within 10 seconds of server time will be accepted.                                                                                                                                                                                                                                                                                        |                                               |
| `iss` | Issuer          | UUID `client_id` of the entity client whose key is used to sign the token.                                                                                                                                                                                                                                                                                                                    | `2fc014f2-e9b4-41d4-ad6b-c360b8ee6229`        |
| `jti` | JWT             | A unique identifier for the JWT. For (future) protection against replay attacks.                                                                                                                                                                                                                                                                                                              |                                               |
| `sub` | Subject         | Optional. Use if the client wants to assume party as part of the request. Format `no:party:<id_type>:<id>:<party_type>`. `id_type` is the party's `business_id_type`. `party_type` is one of: `balance_responsible_party`, `end_user`, `energy_supplier`, `flexibility_information_system_operator`, `market_operator`, `organisation`, `service_provider`, `system_operator`, `third_party`. | `no:party:gln:1234567890123:service_provider` |

The JWT must be signed by the entity client's RSA private key. The public key
must be uploaded to the client in the portal prior to making the request. An
example of how to generate a key pair is shown below. Upload the contents of the
file `.flex.pub.pem` in the portal.

```bash
openssl genrsa -out .flex.key.pem 3072
openssl rsa -in .flex.key.pem -pubout -out .flex.pub.pem
```

How to sign a JWT using the private key depends on your programming
language/system of choice. Here are a few examples/guides:

* Python - [PyJWT](https://pyjwt.readthedocs.io/en/stable/usage.html#encoding-decoding-tokens-with-rs256-rsa)
* Bash - See this [gist](https://gist.github.com/shu-yusa/213901a5a0902de5ad3f62a61036f4ce?permalink_comment_id=4263484#gistcomment-4263484)
* Go - [jwx](https://github.com/lestrrat-go/jwx/blob/develop/v3/docs/02-jws.md#verification-using-a-jwks)

The response from the endpoint will be a JWT access token that can be used to
access the API.

## Token exchange

If the user has logged in via OpenID connect, the user can
assume a party by doing a
[OAuth 2.0 Token Exchange (RFC8693)](https://datatracker.ietf.org/doc/html/rfc8693)
that lets an entity "impersonate" a party with the returned token. This is done
by calling the same `/token` endpoint, this time with the `grant_type`
`urn:ietf:params:oauth:grant-type:token-exchange`.

RFC8693 does _not_ cover the case where the client that does token exchange
doesn't have a valid token for the party it wants to impersonate. The spec is
mostly covering use-cases of backends calling other backends, but is flexible
enough to fit our needs.

!!! quote "RFC8693"

    Additional profiles may provide more detailed requirements around the specific
    nature of the parties and trust involved, such as **whether signing and/or
    encryption of tokens is needed** or if proof-of-possession-style tokens will be
    required or issued. However, **such details will often be policy decisions made
    with respect to the specific needs of individual deployments** and will be
    configured or implemented accordingly.

Other systems have met this gap by loosely implementing the RFC, e.g. by
[using a custom token type](https://zitadel.com/docs/guides/integrate/token-exchange#impersonation-by-user-id-example)
or adding
[additional form parameters](https://www.keycloak.org/docs/23.0.2/securing_apps/#form-parameters).
We do it by using the access token, first obtained when logging in as an entity,
as the `actor_token`.
Instead of using another token (_i.e._, `subject_token`) to specify the party
the user wants to assume, we just expect the party ID in an additional `scope`
parameter in the URL-encoded body of the request.

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&actor_token=<token from step 1>&
&actor_token_type=urn:ietf:params:oauth:token-type:jwt
&scope=assume:party:<desired_party_id>
```

The response from the endpoint will be a JWT access token that can be used to
access the API.

## User information endpoint

OIDC provides a way to get user information. This is done by calling the
`/userinfo` endpoint with the access token. The response is a JSON object
with a set of claims about the user.
