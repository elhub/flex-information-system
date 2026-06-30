# API troubleshooting

This page is for you if you are having trouble using the API. Maybe you have
encountered a weird error message or experienced unexpected behavior.

We acknowledge that the API is not perfect yet (but we are working hard to make
it so 🤓). In the interim, this is where you can find common issues (and
solutions 🤞).

Reach out to us if you have a problem that is not listed here.

## The API returns a 403 with no error message

The request was probably flagged as malicious. Check the following:

* Did you set a `User-Agent` header? The API requires a `User-Agent` header to
  be set.
