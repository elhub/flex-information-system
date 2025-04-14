# eic

This extension equips PostgreSQL with functions to validate EIC identification
codes. The implementation is based on [this document](https://eepublicdownloads.entsoe.eu/clean-documents/EDI/Library/cim_based/EIC_Data_Exchange_IG_v1.2.pdf).

We use these features to handle MGA identifiers in the Flexibility Information
System.

## Test

Testing is done with [pgTap](https://pgtap.org/documentation.html).
