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

GET {{ auth_url }}/session
Cookie: __Host-flex_session={{ access_token }}

HTTP 200
