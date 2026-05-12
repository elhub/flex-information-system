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
[Query]
id: eq.1
select: *,controllable_unit(*,accounting_point(*,bidding_zone,balance_responsible_party!inner(*,balance_responsible_party!inner(*))))
controllable_unit.accounting_point.balance_responsible_party.balance_responsible_party.business_id: eq.1337000000006


GET {{ api_url }}/service_providing_group_membership
Authorization: Bearer {{ access_token }}
[Query]
id: eq.1
embed: controllable_unit(accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party)))

GET {{ api_url }}/service_providing_group_membership/1
Authorization: Bearer {{ access_token }}
[Query]
embed: controllable_unit(accounting_point(bidding_zone,balance_responsible_party(balance_responsible_party)))
