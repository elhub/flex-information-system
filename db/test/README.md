# Database unit tests

This subfolder contains the unit tests on our custom PostgreSQL extensions.

## Debugging

To debug a specific test script use a docker compose exec like

```bash
# the extension
docker compose exec dbtest psql -U postgres -f /pg_timeline/pg_timeline.sql

# or individual tests
docker compose exec dbtest psql -U postgres -f /pg_timeline/test/05_base.sql
```

To connect to the test database use

```bash
# exec into the container as the postgres user
docker compose exec dbtest su postgres

# then inside the container connect to the database
psql
```
