POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: urn:ietf:params:oauth:grant-type:jwt-bearer
assertion: {{ grant_jwt }}
HTTP 200

[Captures]
access_token: jsonpath "$.access_token"

GET {{ postgrest_url }}/service_providing_group_membership
Authorization: Bearer {{ access_token }}
API-Version: 2026-06-08
[Query]
id: eq.1
select: *,controllable_unit(*,accounting_point(*,bidding_zone!inner(*),balance_responsible_party!inner(*,balance_responsible_party!inner(*))))
controllable_unit.accounting_point.balance_responsible_party.balance_responsible_party.business_id: eq.1337000000006


GET {{ api_url }}/service_providing_group_membership
Authorization: Bearer {{ access_token }}
API-Version: 2026-06-08
[Query]
id: eq.1
embed: controllable_unit(accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party)))

GET {{ api_url }}/service_providing_group_membership/1
Authorization: Bearer {{ access_token }}
API-Version: 2026-06-08
[Query]
embed: controllable_unit(accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party)))

GET {{ api_url }}/controllable_unit/1
Authorization: Bearer {{ access_token }}
API-Version: 2026-06-08
[Query]
embed: accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party))
accounting_point.bidding_zone.valid_at: {{newDate}}
HTTP 200
[Asserts]
jsonpath "$.accounting_point.bidding_zone" isList
