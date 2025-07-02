# HTTP testing w/ VS Code

In this directory you can find HTTP request files that can be used to test the
Flex API using the HTTP REST Client extension for Visual Studio Code.

## Getting started

## Install REST Client for VS Code

Install
[REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
for VS Code.

### Obtaining an API key

There are many ways to get an API key. See
[Auth docs](../../docs/technical/auth.md) for details on using the "regular" methods.

For manual testing it might be easiest to log in to the portal, then copy the
API key from the browsers cookie storage. Explained below:

1. Open the [Flex Portal](https://flex-test.elhub.no/).
2. Log in with your user.
3. Select the party you want to be.
4. Open the developer tools in your browser (usually F12).
5. Click on `application`
6. Go the `Storage` tab, open `Cookies` and find the `_Host-flex_session` cookie.
7. Copy the value of the cookie.

You now have your API key.

### Add the API key in setting

1. Open the settings in VS Code in JSON format. Use Ctrl + Shift + P and search
   for "Preferences: Open User Settings (JSON)".
2. Add `rest-client.environmentVariables` as shown below:

    ```json
    "rest-client.environmentVariables": {
        "flex-test.elhub.no": {
            "host": "flex-test.elhub.no",
            "jwt": "<the token you copied from the cookie>",
        }
    }
    ```

3. Go to `test`, open `http` and click on the test you want to run (example: `controllable_unit_lookup.http`)
4. Select Environment (bottom right corner of VS Code) and select
   `flex-test.elhub.no`.

### Running requests

Run the request by clicking on the `Send Request` link above the request in the
`.http` file.

There are also keyboard shortcuts etc. See HTTP Client documentation for details.
