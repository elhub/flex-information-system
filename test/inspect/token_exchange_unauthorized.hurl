# successful token exchange
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: client_credentials
client_id: 3733e21b-5def-400d-8133-06bcda02465e
client_secret: 87h87hijhulO
HTTP 200
[Captures]
actor_token: jsonpath "$.access_token"

GET {{ auth_url }}/userinfo
Authorization: Bearer {{ actor_token }}
HTTP 200
[Captures]
entity_id: jsonpath "$.entity_id"

GET {{ api_url }}/party_membership?entity_id=eq.{{ entity_id}}
Authorization: Bearer {{ actor_token }}
HTTP 200
[Captures]
party_id: jsonpath "$.[0].party_id"

POST {{ auth_url }}/token
Authorization: Bearer {{ actor_token }}
[FormParams]
grant_type: urn:ietf:params:oauth:grant-type:token-exchange
actor_token: {{ actor_token }}
actor_token_type: urn:ietf:params:oauth:token-type:jwt
# non-existing party
scope: assume:party:98987
HTTP 400
