# Changelog

This changelog tracks all changes that are visible in our API.

<!-- markdownlint-disable MD013 -->
## 2026-11-11

* **Added product-specific details to the _Service Providing Group Product Application_ resource.**
    * Added `application_details` (written by the service provider) and
      `assessment_details` (written by the procuring system operator). Both are
      objects whose variant is selected by `kind`, which is the `business_id`
      of the product type. See the
      [resource documentation](resources/service_providing_group_product_application.md#product-specific-details).
    * Variants are available for _Manual Frequency Restoration_ (existing
      fields), _Frequency Containment Normal_ (FCR-N) and _Frequency Containment
      Disturbance_ (FCR-D).
    * An application must now be for **exactly one** product type
      (`product_type_ids` must contain one element).
* **Deprecated the fields `maximum_active_power_up`, `maximum_active_power_down`, `ramping_capability`, `ramping_description` and `additional_information` of the _Service Providing Group Product Application_ resource.**
    * Use `application_details` instead. The fields are kept in sync with
      `application_details` for _Manual Frequency Restoration_ applications
      during a transition period, and are removed later. They are no longer
      accepted for other product types.
    * `maximum_active_power_up` and `maximum_active_power_down` are no longer
      required and may be `null` in responses.
* **Added the product type _Frequency Containment Disturbance_ (`automatic_frequency_containment_disturbance`).**
  The product type `automatic_frequency_containment` is now _Frequency
  Containment Normal_ (FCR-N) only.

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
