# successful token exchange
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: client_credentials
client_id: test.suite@flex.test
client_secret: 87h87hijhulO
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


GET {{ auth_url }}/userinfo
Authorization: Bearer {{ party_token }}
HTTP 200
