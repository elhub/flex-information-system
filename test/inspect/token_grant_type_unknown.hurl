# A call to token with the incorrect grant type
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: bad_grant_type
client_id: whatever
client_secret: whatever
