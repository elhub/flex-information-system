# Changelog

This changelog tracks all changes that are visible in our API.

<!-- markdownlint-disable MD013 -->

## 14.07.2025

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
