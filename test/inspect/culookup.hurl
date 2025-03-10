# login as FISO

POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: client_credentials
client_id: test.suite@flex.test
client_secret: 87h87hijhulO
HTTP 200

[Captures]
access_token: jsonpath "$.access_token"

POST {{ auth_url }}/assume
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ access_token }}
[FormParams]
party_id: 18
HTTP 200
[Captures]
session: cookie "__Host-flex_session"

# various cases of ill formed request / CU not found

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
HTTP 400

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
[FormParams]
end_user_id: 11
HTTP 400

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
[FormParams]
end_user_id: 11
accounting_point_id: 12359120doesnotexist
HTTP 404

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
[FormParams]
end_user_id: 11
business_id: 12359120doesnotexist
HTTP 404

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
[FormParams]
end_user_id: 11
accounting_point_id: 12359120doesnotexist
business_id: 12359120doesnotexist
HTTP 404

# now works

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
[FormParams]
end_user_id: 11
accounting_point_id: 133700000000010007
HTTP 200
[Asserts]
jsonpath "$" count >= 1

# create another CU and change to SP user

POST {{ api_url }}/controllable_unit
Content-Type: application/json
Cookie: __Host-flex_session={{ session }}
{
    "name": "TEST-CU-LOOKUP",
    "accounting_point_id": "133700000000010007",
    "regulation_direction": "both",
    "maximum_available_capacity": 3.5
}
HTTP 201
[Captures]
cu_id: jsonpath "$.id"
cu_business_id: jsonpath "$.business_id"

DELETE {{ auth_url }}/assume
Cookie: __Host-flex_session={{ session }}
HTTP 200

POST {{ auth_url }}/assume
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
[FormParams]
party_id: 16
HTTP 200
[Captures]
session_sp: cookie "__Host-flex_session"

# check SP cannot read CU yet, but can lookup and add a contract

GET {{ api_url }}/controllable_unit/{{ cu_id }}
Cookie: __Host-flex_session={{ session_sp }}
HTTP 406

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session_sp }}
[FormParams]
end_user_id: 11
business_id: {{ cu_business_id }}
HTTP 200
[Captures]
cu_id_by_lookup: jsonpath "$[0].id"
[Asserts]
jsonpath "$" count == 1
variable "cu_id_by_lookup" == {{ cu_id }}

POST {{ api_url }}/controllable_unit_service_provider
Content-Type: application/json
Cookie: __Host-flex_session={{ session_sp }}
{
    "controllable_unit_id": {{ cu_id_by_lookup }},
    "service_provider_id": 16,
    "contract_reference": "TEST-CONTRACT",
    "valid_from": "{{ window_ok_valid_from }}",
    "valid_to": null
}
HTTP 201
