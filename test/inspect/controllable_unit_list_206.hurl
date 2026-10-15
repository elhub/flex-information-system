# Get party token (assumed role) and request a ranged PostgREST response (206)
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: urn:ietf:params:oauth:grant-type:jwt-bearer
assertion: {{ grant_jwt_entity }}
HTTP 200
[Captures]
entity_token: jsonpath "$.access_token"

GET {{ auth_url }}/userinfo
Authorization: Bearer {{ entity_token }}
HTTP 200
[Captures]
entity_id: jsonpath "$.entity_id"

GET {{ api_url }}/party_membership?entity_id=eq.{{ entity_id}}
Authorization: Bearer {{ entity_token }}
HTTP 200
[Captures]
party_id: jsonpath "$.[0].party_id"

POST {{ auth_url }}/token
Authorization: Bearer {{ entity_token }}
[FormParams]
grant_type: urn:ietf:params:oauth:grant-type:token-exchange
actor_token: {{ entity_token }}
actor_token_type: urn:ietf:params:oauth:token-type:jwt
scope: assume:party:{{ party_id }}
HTTP 200
[Captures]
party_token: jsonpath "$.access_token"

GET {{ api_url }}/controllable_unit?select=id,name,status&order=id.desc
Authorization: Bearer {{ party_token }}
Range-Unit: items
Range: 0-0
Prefer: count=exact
HTTP 206
[Asserts]
jsonpath "$[0]" exists
jsonpath "$[0].id" exists
