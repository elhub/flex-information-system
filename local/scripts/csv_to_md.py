#!/usr/bin/env python3
import csv
import sys
import tabulate as t

# To align with the Prettify markdown table function in VSCode.
t.MIN_PADDING = 0

csv_reader = csv.reader(sys.stdin, delimiter=";")
# exclude resource-level permissions because this script generates the FLA table
headers = next(csv_reader)
excluded_rows = ("", None, "_", "-")

excluded_cols = {col for col in ("MO", "SCHEMA") if col in headers}
excluded_idxs = {headers.index(col) for col in excluded_cols}
for col in sorted(excluded_cols, key=lambda c: headers.index(c), reverse=True):
    headers.pop(headers.index(col))

if excluded_idxs:
    rows = [
        [cell for i, cell in enumerate(row) if i not in excluded_idxs]
        for row in csv_reader
        if row[0] not in excluded_rows
    ]
else:
    rows = [row for row in csv_reader if row[0] not in excluded_rows]
print(t.tabulate(rows, tablefmt="github", headers=headers))
