# -*- coding: utf-8 -*-
import yaml
import sys

"""
This small script fills the schema property in the sqlc.yaml file for the
backend, mentioning one schema file per argument given to the script.
"""

DB_DIR = "./db"
# ------------------------------------------------------------------------------

if __name__ == "__main__":
    yaml.SafeDumper.ignore_aliases = lambda self, data: True
    sqlc_yaml = yaml.safe_load(sys.stdin)
    sqlc_yaml["sql"][0]["schema"] = sys.argv[1:]

    print("---")
    yaml.dump(sqlc_yaml, sys.stdout)
