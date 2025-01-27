# successful token exchange
POST {{ auth_url }}/token
Authorization: Bearer not.a.jwt.token
[FormParams]
grant_type: urn:ietf:params:oauth:grant-type:token-exchange
actor_token: not.a.jwt.token
actor_token_type: urn:ietf:params:oauth:token-type:jwt
# non-existing party
scope: assume:party:1
HTTP 400
