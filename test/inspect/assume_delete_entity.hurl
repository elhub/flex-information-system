# we need to get a valid cookie first
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: urn:ietf:params:oauth:grant-type:jwt-bearer
assertion: {{ grant_jwt_entity }}
HTTP 200

[Captures]
entity_token: jsonpath "$.access_token"

DELETE {{ auth_url }}/assume
Cookie: __Host-flex_session={{ entity_token }}
HTTP 400
