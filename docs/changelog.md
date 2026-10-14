# Changelog

This changelog tracks all changes that are visible in our API.

<!-- markdownlint-disable MD013 -->
## 2026-10-13

* **Removed the `client_credentials` grant type from the `/token` endpoint of the auth API.**
  Requests with `grant_type=client_credentials` are no longer accepted.
  Use the `JWT Bearer` grant instead: upload a public key to the entity client and
  authenticate with a self-signed JWT (see [Authentication methods](auth/authn-methods.md)).
* **Removed the `client_secret` field from the _Entity Client_ resource.**

## 2026-09-17

* **Removed default limit on list endpoint**
  This was previously transparently set to 2000.

## 2026-09-07

* **Added `created_at` field to the _Service Providing Group_ resource.**
* **Added `created_at` and `complete_at` fields to the _Service Providing Group Product Application_ resource.**

## 2026-06-08 · Initial release

* **Initial public release of the Flexibility Information System API.**
  All endpoints are available under `Api-Version: 2026-06-08`.
