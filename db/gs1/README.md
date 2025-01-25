# gs1

This extension equips PostgreSQL with functions to validate GS1 identification
numbers. The implementation is based on [this document](https://assets.ctfassets.net/9uypwcnuzbqi/7oxH9aoSSK3z1v4TorzfCY/bc949d91aa4b1e1a03e7743b9704ee41/GS1au-fact-sheet-manual-check-digit-calculation.pdf).
We use these features to handle GSRN and GLN identifiers in the Flexibility
Information System.

## Test

Testing is done with [pgTap](https://pgtap.org/documentation.html).
