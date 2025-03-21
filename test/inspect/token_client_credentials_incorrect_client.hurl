# A call to token with the incorrect grant type
POST {{ auth_url }}/token
Content-Type: application/x-www-form-urlencoded
[FormParams]
grant_type: client_credentials
client_id: 4fcc4592-678b-4901-96fd-8051092d8982
client_secret: "87h87hijhulO"
