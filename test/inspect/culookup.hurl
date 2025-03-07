# we need to get a valid cookie first
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

POST {{ api_url }}/controllable_unit
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ session }}
[FormParams]
end_user_id: 11
accounting_point_id: 133700000000010007
business_id:
HTTP 200
