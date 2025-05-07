#!/usr/bin/env bash
# Loads the structure and data into the database
# Assumes that PGHOST is set

set -euxo pipefail

# check if PGHOST is set
if [ -z "${PGHOST}" ]; then
	echo "PGHOST is not set"
	exit 1
fi

# where the script is located
db_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
cd "$db_dir"

psql -X -v ON_ERROR_STOP=1 -d flex -U postgres -f pre.sql
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f flex_base.sql
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f flex_auth.sql
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f flex_structure.sql
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f flex/grants/field_level_authorization.sql
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f flex_reference_data.psql || true
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f test_data/test_data.sql
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f users.sql

# api module
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f api_structure.sql
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f api/grants/field_level_authorization.sql

# auth module
psql -X -v ON_ERROR_STOP=1 -d flex -U flex -f auth/functions.sql

# logical replication
psql -X -v ON_ERROR_STOP=1 -d flex -U postgres -f replication.sql
