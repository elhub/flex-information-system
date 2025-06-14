# Changelog

<!-- markdownlint-disable MD013 -->

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
