# we need to get a valid cookie first
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: urn:ietf:params:oauth:grant-type:jwt-bearer
assertion: {{ grant_jwt_entity }}
HTTP 200

[Captures]
access_token: jsonpath "$.access_token"

GET {{ auth_url }}/session
Cookie: __Host-flex_session={{ access_token }}

HTTP 200
