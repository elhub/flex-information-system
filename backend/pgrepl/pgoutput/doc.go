// Package pgoutput contains types for parsing PostgreSQL's logical replication
// protocol output format, known as "pgoutput".
// We are using it just to provide a namespace for the variables.
//
//   - https://www.postgresql.org/docs/16/protocol-logical-replication.html
//   - https://www.postgresql.org/docs/16/protocol-logicalrep-message-formats.html
//
// A nice walkthrough of the format can be found here: https://peterullrich.com/listen-to-database-changes-through-the-postgres-wal
package pgoutput
