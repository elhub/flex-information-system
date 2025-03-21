# we need to get a valid cookie first
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: client_credentials
client_id: 3733e21b-5def-400d-8133-06bcda02465e
client_secret: 87h87hijhulO
HTTP 200

[Captures]
access_token: jsonpath "$.access_token"

GET {{ auth_url }}/userinfo
Authorization: Bearer {{ access_token }}
HTTP 200
[Captures]
entity_id: jsonpath "$.entity_id"

GET {{ api_url }}/party_membership?entity_id=eq.{{ entity_id }}
Authorization: Bearer {{ access_token }}
HTTP 200
[Captures]
party_id: jsonpath "$.[0].party_id"

POST {{ auth_url }}/assume
Content-Type: application/x-www-form-urlencoded
Cookie: __Host-flex_session={{ access_token }}
[FormParams]
party_id: {{ party_id }}
HTTP 200
