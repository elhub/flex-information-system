#!/usr/bin/env python3
import csv
import sys
import tabulate as t

# To align with the Prettify markdown table function in VSCode.
t.MIN_PADDING = 0

csv_reader = csv.reader(sys.stdin, delimiter=";")
# exclude resource-level permissions because this script generates the FLA table
rows = [row for row in csv_reader if row[0] not in ("", None, "_", "-")]
print(t.tabulate(rows, tablefmt="github", headers="firstrow"))
