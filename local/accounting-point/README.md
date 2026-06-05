# Accounting Point Adapter

This is a local implementation of the Accounting Point Adapter.

To spin it up, run the following command in the root of the repository:

```bash
./.venv/bin/python local/accounting-point/main.py
```

You can then access the API on port 5001.

List of accounting points that already are generated using the test data package
can be found in the [test data
docs](https://elhub.github.io/flex-information-system/guides/test-data/).

Example:

<!-- markdownlint-disable MD034 -->
* http://127.0.0.1:5001/accounting_point/133700000000010076

If we want to have some accounting points that do _not_ exist in the test data
package and thus ends in a new sync, we can modify some of the zeros and
[calculate a new check
digit](https://www.gs1.org/services/check-digit-calculator).

Example:

* http://127.0.0.1:5001/accounting_point/133701000000019993
* http://127.0.0.1:5001/accounting_point/133702000000019992
