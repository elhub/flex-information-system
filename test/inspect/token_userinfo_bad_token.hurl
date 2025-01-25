# successful token exchange
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: client_credentials
client_id: test.suite@flex.test
client_secret: 87h87hijhulO
HTTP 200

[Captures]
actor_token: jsonpath "$.access_token"

GET {{ auth_url }}/userinfo
Authorization: Bearer not.a.valid.token
