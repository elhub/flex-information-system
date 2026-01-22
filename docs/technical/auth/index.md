# Auth

This section describes the authentication and authorization model, principles
and concepts we are following in the Flexibility Information System. It is a set
of quite comprehensive documents containing a lot of nitty-gritty details - even
about implementation. We are using it both as a design document and
documentation. You can use it as a reference and for understanding how we are
doing things.

The documents assume that you have some basic knowledge around the topic, such
as the distiction between authentication and authorization, but we will try to
add external links to relevant resources where appropriate (like we just did 😉).

> [!NOTE]
>
> We use _auth_ as a short form for _authentication and authorization_ in this
> section. When they need to be distinguished, for instance in the links and
> filenames, we write _authn_ for _authentication_ and _authz_ for
> _authorization_.

## Details

<!-- markdownlint-disable MD033 -->
<div class="grid cards" markdown>

* :fontawesome-regular-id-card: [Authentication model](./authn-model.md)  
  How are users identified? What are the possible roles in the system?
* :fontawesome-solid-key: [Authentication methods](./authn-methods.md)  
  How can a user log in to the FIS?
* :fontawesome-solid-user-cog: [Authorization](./authz-model.md)  
  What is a user allowed to do?
* :fontawesome-solid-rocket: [Getting started](./getting-started.md)  
  Set up your API user and register your first controllable unit
* :fontawesome-solid-users: [Users management](./users-management.md)  
  How to manage access to assets in the system?

</div>
<!-- markdownlint-enable MD033 -->

## Overview

We think of auth as a layered system, where each layer has a specific purpose
and responsibility. The layers are independent of each other and a request is
required to pass all the layers to be allowed access. The following diagram
shows the layers we have in our model.

![Auth Layers](../diagrams/auth_layers.drawio.png)

The layers in the auth model are there to protect our resources. These resources
take the form of data or remote procedure calls (RPCs) in our APIs. You can
think of a resource as a path in our API, e.g. `/api/v0/controllable_unit/`.
Authorization protects what actions (create, read, update, delete, call) the
user can do on the resources.

1. **Session or token validation** - This is how we authenticate the user. Once
   authentication is done we know the entity, party and scopes of the user. If
   there is no session or token the user enters the system as an anonymous user
   with read access.
2. **Scope check** - Empty scope means no access. The scope check validates actions
   on resources, e.g. does the user have the scope to do update on this
   resource.
3. **Party type check** - Actions on some resources might only be accessible for
   certain party types, like the `Flexibility Information System Operator` or
   `System Operator`. For these resources we have an explicit party type check
   for additional security, e.g. is the party type of the user allowed to do
   call this resource. We typically use this on RPC resources.
4. **Field Level Authorization** - FLA controls access for the combination of
   party type, action and fields, e.g. can this party type update these fields on
   this resource.
5. **Resource Level Authorization** - RLA controls access for the specific party
   and resource, e.g. can this party delete this resource.

Read more details about the layers further down in this document.

## Actions

When we talk about authorization we usually talk about performing "actions" on
resources or fields. The table below shows the actions and their corresponding
[HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) and
[database grants](https://www.postgresql.org/docs/15/sql-grant.html).

| Action     | HTTP verb | Database grant | Usage                        |
|------------|-----------|----------------|------------------------------|
| **C**reate | POST      | INSERT         |                              |
| **R**ead   | GET       | SELECT         |                              |
| **U**pdate | PATCH     | UPDATE         |                              |
| **D**elete | DELETE    | DELETE         |                              |
| **C**all   | POST      | EXECUTE        | Used for RPC type endpoints. |

We do not model `List` as a specific action even tho it is a verb - someting a
user can do - on the [API](api-design.md). It is covered by `Read`.

## OAuth 2.0 and OpenID Connect standards

We are relying on the patterns and flows established as part of multiple RFCs
related to OAuth 2.0 as well as
[OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html).
Relevant RFCs are listed below, but you can also check the
[map of OAuth 2.0 specs from Okta](https://www.oauth.com/oauth2-servers/map-oauth-2-0-specs/).

* [RFC6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
* [RFC6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750)
* [RFC7636 - Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636)
* [RFC7523 - JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and Authorization Grants](https://datatracker.ietf.org/doc/html/rfc7523)
* [RFC8693 - OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)

The implementation
follows only parts of these standards, but we are trying to comply with the
specification for the parts we actually implement.

We are also relying heavily on the JOSE (Javascript Object Signing and Encryption)
[suite of specifications](https://datatracker.ietf.org/wg/jose/about/).

!!! note "Distinct API for authentication"

    Note that authentication and the rest of the Flexibility Information System
    work as two _separate_ services, and as such, are exposed through _distinct_
    APIs. The endpoints can be reached by using the `/api` or
    `/auth/` prefixes in the URL used to access the Flexibility Information
    System APIs. In the rest of this page, we use the terms _main API_ and _auth API_
    to distinguish these distinct roots of API endpoints.
