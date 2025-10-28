# Changelog

This changelog tracks all changes that are visible in our API.

<!-- markdownlint-disable MD013 -->
## 27.10.2025

* **Added the _Service Providing Group Grid Suspension Comment_ resource.**

## 08.10.2025

* **Added the _Service Providing Group Grid Suspension_ resource.**

## 26.09.2025

* **Updated the `visibility` field's specification on the _SP product application comment_ and the _SP product suspension comment_ resources.**  
  Comments now have only two possible visibilities: they can either be private
  comments internal to a given party, or comments opened to any party related to
  the application or suspension.

## 16.09.2025

* **Renamed all `last_X` timestamp fields into `X_at`.**
  This touches the following resources: controllable unit, service provider
  product application, service providing group grid prequalification, and
  service providing group product application.

* **Added `inactive` status value for _Controllable Unit_ and _Service Providing Group_.**
  In the case of controllable unit, this value replaces `suspended`.

* **Added the _Service Provider Product Suspension_ resource.**

## 29.08.2025

* **Added `scopes` and `party_id` fields to the _Entity Client_ resource.**  

## 15.07.2025

* **Introduced the _Entity Lookup_ operation.**  
  To be used while administrating memberships for parties related to an
  organisation with entities that may not exist or be readable yet.

* **Added `scopes` field to the _Party Membership_ resource.**

## 01.07.2025

* **Added audit fields and history on the _Entity_ resource.**  
  The resource can now be created and updated by users with the FISO role.

* **Changed the body format of the response for the _Controllable Unit Lookup_ operation.**  
  The operation now returns technical information about the accounting point and
  the end user in addition to controllable units and technical resources.
  The operation can also return HTTP 403 when the given arguments do not match
  each other.

## 26.06.2025

* **Specified the `data` field in the _Notice_ resource.**  
  The field turns into an `object`, whose content depends on the `type` of the
  notice.

## 03.06.2025

* **Added _Accounting Point Energy Supplier_ resource.**

* **Added a notice for inconsistency between _Controllable Unit Service Provider_ and _Accounting Point End User_.**

* **Added end user technical ID to _Controllable Unit Service Provider_.**  
  This ID is now also returned in the _Controllable Unit Lookup_ operation, so
  that SPs can first lookup and then create relations with the required data.

* **Removed the `id` field from _Notice_ and _Accounting Point Balance Responsible Party_.**  
  These were non-stable identifiers, not linking to any actual resource.

## 28.05.2025

* **Removed _Connecting System Operator_ on the _Controllable Unit_ resource.**  
  The information remains available as [_System Operator ID_](resources/accounting_point.md#field-system_operator_id),
  through the [_Accounting Point ID_](resources/controllable_unit.md#field-accounting_point_id).
