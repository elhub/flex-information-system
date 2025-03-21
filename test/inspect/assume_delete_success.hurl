# we need to get a valid cookie first
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: client_credentials
client_id: 3733e21b-5def-400d-8133-06bcda02465e
client_secret: 87h87hijhulO
HTTP 200

[Captures]
entity_token: jsonpath "$.access_token"

GET {{ auth_url }}/userinfo
Authorization: Bearer {{ entity_token }}
HTTP 200
[Captures]
entity_id: jsonpath "$.entity_id"

GET {{ api_url }}/party_membership?entity_id=eq.{{ entity_id }}
Authorization: Bearer {{ entity_token }}
HTTP 200
[Captures]
party_id: jsonpath "$.[0].party_id"

POST {{ auth_url }}/assume
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ entity_token }}
[FormParams]
party_id: {{ party_id }}
HTTP 200
[Captures]
party_token: cookie "__Host-flex_session"

DELETE {{ auth_url }}/assume
Cookie: __Host-flex_session={{ party_token }}
HTTP 200
[Captures]
delete_cookie: cookie "__Host-flex_session"

GET {{ auth_url }}/userinfo
Authorization: Bearer {{ delete_cookie }}
HTTP 200
[Asserts]
jsonpath "$.current_role" == "flex_entity"
jsonpath "$.party_id" not exists
