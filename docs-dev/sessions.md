# Sessions

This document contains some information about how we deal with sessions and
implement the OpenID Connect protocol for login in portal.

## Overview

We will probably use
[IDPorten](https://docs.digdir.no/docs/idporten/oidc/oidc_auth_spa) as the
identity provider for persons using the production system via the portal.
IDPorten is based on OpenID Connect (OIDC).

In local dev we are using a OIDC compliant mock solution called
[Authelia](https://www.authelia.com/), while in external test environments, we
are using
[Oracle Cloud Identity and Access Management (IAM)](https://docs.oracle.com/en-us/iaas/Content/Identity/getstarted/identity-domains.htm)
(OCI IAM) and [Microsoft Azure Entra B2C](https://learn.microsoft.com/nb-no/entra/identity-platform/v2-protocols-oidc#fetch-the-openid-configuration-document).

In this diagram with refer to these solutions as the _Identity Provider_ (IDp).

## Backend For Frontend (BFF)

We are following the pattern known as
[Backend For Frontend](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-backend-for-frontend-bff)
(BFF). The tokens are opaque and the session state is kept in the database (see
[Tokens and sessions](#tokens-and-sessions)), so no "sticky sessions" are needed.
The cookie setting follows the cookie security recommendations, including the
[`__Host-` prefix.](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-19#name-the-__host-prefix).

We are using the OpenID Connect Authorization Code Flow with Proof Key for Code
Exchange (PKCE) and
[Pushed Authorization Requests](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-par-06)
(PAR).

The following diagram shows the sequence of OIDC login and the BFF.

![OIDC login sequence](diagrams/oidc_login_sequence.png)

### Tokens and sessions

Tokens are **opaque** and carry no information. Such information about the
current user is available from the `/userinfo` endpoint. Internally, the data
API still forwards short-lived JWTs to PostgREST as it needs one to switch roles.

Opaque tokens contain no claims, so the server must look up what a token means.
This is done in two database tables, `session` and `token`. Both are `UNLOGGED`
and are kept out of the audit mechanisms, since they are written on every login
and refresh. They only contain hashes, so there is nothing worth restoring in
case of crash for instance.

#### Refresh tokens

To avoid asking the user to log in again every time their access token expires,
we use refresh tokens. Refresh tokens are long-lived, opaque tokens that can
only be used to get a new access token from a dedicated refresh endpoint in the
BFF. Like access tokens, they are stored in cookies and not accessible to
JavaScript in the portal. Whenever the portal gets an authentication failure
from the API, it calls the refresh endpoint to receive new tokens and retries
the request. Optionally, it can also call the refresh endpoint a little before
expiry of the access token, to avoid most failed requests for this reason.

The logic of the refresh endpoint is the one of the
[standard OAuth 2.0 `refresh_token` grant](https://www.rfc-editor.org/info/rfc6749/#section-6),
but we choose not to ask or return refresh tokens in the body of requests and
responses on the refresh endpoint, and only transport them in cookies, for
security reasons.

Refresh tokens are _rotated_: every refresh returns a new refresh token and
invalidates the previous one. We remember used tokens so as to detect reuse: if
an already used token is presented again, the whole session is revoked and the
user must log in again. Logging out also revokes the session.

The refresh only needs the refresh token. It belongs to a session, so the new
tokens are issued for that session, with its current identity and scope. Nothing
needs to be read from the expired access token.

#### Session

A session is created at login (or when a client authenticates with the
`JWT Bearer` grant, or when a token exchange is done). It represents _who_ is
logged in and _what they may do_, independently of which tokens are currently
valid.

| Column        | Description                                                                                  |
|---------------|----------------------------------------------------------------------------------------------|
| `id`          | Primary key.                                                                                 |
| `identity_id` | The identity (entity, assumed party and client) of the session. The role is derived from it. |
| `scope`       | The scopes granted to the session.                                                           |
| `parent_id`   | The session this one was exchanged from (token exchange), if any. Cascade delete.            |
| `expires_at`  | Absolute end of the session. Refresh token rotation never extends it.                        |

We store the session, and not just the tokens, for the following reasons:

* **The identity and scope change during a session, but the tokens should not.**
  When the user assumes or unassumes a party, only the `identity_id` and
  `scope` of the session are updated. The cookies stay the same, and all tabs
  and tokens of the session see the change at once. There is no race between an
  assume and a refresh, since a refresh does not need to carry any claims
  forward. It just issues new tokens for the session as it is.
* **It is the unit of revocation.** All tokens reference their session, so
  logging out, detecting refresh token reuse or an administrative revocation is
  one `DELETE` of the session, and everything that belongs to it goes with it.
* **It carries the absolute lifetime.** Tokens are rotated and short-lived,
  while the session has a maximum age measured from the login. This is what
  makes sure a session cannot be kept alive forever.
* **It links exchanged sessions to their origin.** A token exchange creates a
  child session with `parent_id`, so that revoking the parent also revokes the
  child. Its scope is the intersection of the parent scope and the party scopes,
  and it cannot outlive the parent.

#### Token

A token is a credential of a session. Only the SHA-256 hash of the token is
stored, and the hashing is done by the application, so the token itself never
passes through SQL or its logs.

| Column       | Description                                                       |
|--------------|-------------------------------------------------------------------|
| `token_hash` | Primary key. SHA-256 hash of the token.                           |
| `session_id` | The session the token belongs to. Cascade delete.                 |
| `type`       | `access` or `refresh`.                                            |
| `expires_at` | When the token stops being valid.                                 |
| `used_at`    | Set when a refresh token has been exchanged. For reuse detection. |

We store access tokens, and not only refresh tokens, for the following reasons:

* **An opaque token can only be validated by looking it up.** There is no
  signature to verify and no claims to read. Every API call therefore resolves
  the access token to its session with one indexed lookup. This is the reason we
  need to store them.
* **Revocation takes effect immediately.** Since the lookup happens on every
  call, deleting a session invalidates its access tokens on the next request.
  Without it, a revoked session would stay usable until the access token
  expires, which was the main weakness of a stateless JWT.
* **Machine clients have no refresh token.** Clients using the `JWT Bearer`
  grant only get an access token, which must be stored like any other.

#### Cleanup

Expired sessions and tokens are deleted by a periodic job running inside the
database with [`pg_cron`](https://github.com/citusdata/pg_cron), like we already
do for some functionality (see for instance the notice sync in
[Notices](./notice.md)). Everything runs in the database, so no backend code is
involved. Each run deletes a batch of expired tokens and sessions, based on the
`expires_at` timestamps. An index on `expires_at` keeps the job cheap.

#### Summary of operations

| Operation                 | Effect on `session` and `token`                                                                |
|---------------------------|------------------------------------------------------------------------------------------------|
| Login (`/callback`)       | Create a session, an access token and a refresh token.                                         |
| Refresh                   | Mark the refresh token as used, delete the old access token, insert a new pair in the session. |
| API call                  | Look up the access token to get user info. Forge an internal JWT for PostgREST if needed.      |
| Assume / unassume         | Update `identity_id` and `scope` of the session. Tokens are unchanged.                         |
| Token exchange            | Create a child session (`parent_id`) with one access token.                                    |
| `JWT Bearer` login        | Create a session with one access token. No refresh token.                                      |
| Logout, reuse, revocation | Delete the session. Its tokens and child sessions are deleted with it.                         |

The following diagram shows a refresh, including the failure paths.

![Token refresh sequence](diagrams/token_refresh_sequence.png)

## Logout

Logout is also done via redirects between the Identity provider and the frontend.

The following diagram shows the sequence of OIDC logout.

![OIDC logout sequence](diagrams/oidc_logout_sequence.png)

## Assuming party

After the user has logged in, the user must
[assume a party](../docs/technical/authn-model.md). The `/assume`
endpoint is used by the frontend for this purpose.

## Ensuring compatibility between IDPorten and our mock/test IDP

The IDPorten OpenID Connect provider is picky about quite a few things. E.g. it
only supports the `RS256` alg, recommends PAR and stores the personal ID number
in a non-standard claim.

Our mock solution [Authelia](https://www.authelia.com/) and test solution
[OCI IAM](https://docs.oracle.com/en-us/iaas/Content/Identity/getstarted/identity-domains.htm)
are slightly different to IDPorten.

### OpenID configuration

One way to check the support of a given OpenID Connect provider is to check its
`/.well-known/openid-configuration` endpoint. The Authelia (local), OCI IAM and
IDporten endpoints are:

<!-- markdownlint-disable no-bare-urls -->
* https://idp.flex.internal:9091/.well-known/openid-configuration
* https://idporten.no/.well-known/openid-configuration
* https://idcs-64b43b9cb198438ca17360d2c5bd4b9f.identity.oraclecloud.com/.well-known/openid-configuration
* https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration

The `common` part in the Entra url will be replaced by the tenant ID in a real
setup.

### ID token format and claims

The ID token format at IDPorten is
[well documented](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_id_token).
The most important claim is `pid` - the Norwegian national ID number
(fødselsnummer/d-nummer) of the autenticated end user. This information is
stored in other claims in the other two solutions:

| Solution | Claim                | Description                             |
|----------|----------------------|-----------------------------------------|
| Authelia | `preferred_username` | The username of the authenticated user. |
| OCI IAM  | `sub`                | The subject of the authenticated user.  |
| IDPorten | `pid`                | Custom claim                            |
| Entra    | `preferred_username` | The email of the authenticated user.    |

> [!NOTE]
>
> We really
> [shouldn't use the `preferred_username` claim to identify the user](https://learn.microsoft.com/nb-no/entra/identity-platform/id-token-claims-reference#use-claims-to-reliably-identify-a-user).
> We are doing it because it is simple, but we should move to using the
> `sub`/`oid` claim.

### Logout endpoints

The logout endpoints are also a bit different. The biggest difference is that
Authelia actually does not fully support the OIDC logout flow yet, but it has
enough functionality to "make it work".

| Solution | Logout endpoint         | OIDC logout support | Redirect uri parameter     |
|----------|-------------------------|---------------------|----------------------------|
| Authelia | `/logout`               | no                  | `rd`                       |
| OCI IAM  | `/oauth2/v1/userlogout` | yes                 | `post_logout_redirect_uri` |
| IDPorten | `/logout`               | yes                 | `post_logout_redirect_uri` |
| Entra    | `/oauth2/v2.0/logout`   | yes                 | `post_logout_redirect_uri` |

!!! note "IDPorten logout not fully implemented"

    We have **not** built all the things we need to support
    [logout using IDPorten](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_logout.html).
    Like `id_token_hint` and front channel logout.

## OpenID Connect client

We are building the flow in our Kotlin backend. There are a few OIDC libraries
available for Kotlin. The most notable ones are:

* [Nimbus](https://connect2id.com/products/nimbus-oauth-openid-connect-sdk)
* [Ktor's OIDC plugin](https://ktor.io/docs/server-oidc.html)

Both of these build on OAuth 2. The problem with Nimbus is that it introduces a
new, non-standard dependency, and makes it harder to review the code migrating
away from Go. The problem with the Ktor plugin is that it is experimental and
lacks support for PAR.

We have decided to roll-our-own OIDC client like we did for Go, leaning only on
Ktor mechanisms (e.g. HTTP clients) and existing dependencies such as
`java-jwt` and `jwks-rsa` for the JOSE handling.

## Test user creation in Identity Providers

Test user creation in is manual in the authelia `users.yml` file.
