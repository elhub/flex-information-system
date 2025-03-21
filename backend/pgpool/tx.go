package pgpool

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Tx represents a database transaction acquired from a Pool.
// This is basically a copy from:
// https://github.com/jackc/pgx/blob/master/pgxpool/tx.go
type Tx struct {
	t pgx.Tx
	c *Conn
}

// Begin starts a pseudo nested transaction implemented with a savepoint.
func (tx *Tx) Begin(ctx context.Context) (pgx.Tx, error) {
	return tx.t.Begin(ctx) //nolint:wrapcheck
}

// Commit commits the transaction and returns the associated connection back to the Pool. Commit will return ErrTxClosed
// if the Tx is already closed, but is otherwise safe to call multiple times. If the commit fails with a rollback status
// (e.g. the transaction was already in a broken state) then ErrTxCommitRollback will be returned.
func (tx *Tx) Commit(ctx context.Context) error {
	err := tx.t.Commit(ctx)
	if tx.c != nil {
		tx.c.Release()
		tx.c = nil
	}
	return err //nolint:wrapcheck
}

// MustCommit is a commit but useful for defer statements.
func (tx *Tx) MustCommit(ctx context.Context) {
	_ = tx.Commit(ctx)
}

// Rollback rolls back the transaction and returns the associated connection back to the Pool. Rollback will return ErrTxClosed
// if the Tx is already closed, but is otherwise safe to call multiple times. Hence, defer tx.Rollback() is safe even if
// tx.Commit() will be called first in a non-error condition.
func (tx *Tx) Rollback(ctx context.Context) error {
	err := tx.t.Rollback(ctx)
	if tx.c != nil {
		tx.c.Release()
		tx.c = nil
	}
	return err //nolint:wrapcheck
}

// MustRollback is a commit but useful for defer statements.
func (tx *Tx) MustRollback(ctx context.Context) {
	_ = tx.Rollback(ctx)
}

// CopyFrom wraps pgx.Tx.CopyFrom.
func (tx *Tx) CopyFrom(ctx context.Context, tableName pgx.Identifier, columnNames []string, rowSrc pgx.CopyFromSource) (int64, error) {
	return tx.t.CopyFrom(ctx, tableName, columnNames, rowSrc) //nolint:wrapcheck
}

// SendBatch wraps pgx.Tx.SendBatch.
func (tx *Tx) SendBatch(ctx context.Context, b *pgx.Batch) pgx.BatchResults {
	return tx.t.SendBatch(ctx, b)
}

// LargeObjects wraps pgx.Tx.LargeObject.
func (tx *Tx) LargeObjects() pgx.LargeObjects {
	return tx.t.LargeObjects()
}

// Prepare creates a prepared statement with name and sql. If the name is empty,
// an anonymous prepared statement will be used. sql can contain placeholders
// for bound parameters. These placeholders are referenced positionally as $1, $2, etc.
//
// Prepare is idempotent; i.e. it is safe to call Prepare multiple times with the same
// name and sql arguments. This allows a code path to Prepare and Query/Exec without
// needing to first check whether the statement has already been prepared.
func (tx *Tx) Prepare(ctx context.Context, name, sql string) (*pgconn.StatementDescription, error) {
	return tx.t.Prepare(ctx, name, sql) //nolint:wrapcheck
}

// Exec wraps pgx.tx.Exec.
func (tx *Tx) Exec(ctx context.Context, sql string, arguments ...any) (pgconn.CommandTag, error) {
	return tx.t.Exec(ctx, sql, arguments...) //nolint:wrapcheck
}

// Query wraps pgx.Tx.Query.
func (tx *Tx) Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error) {
	return tx.t.Query(ctx, sql, args...) //nolint:wrapcheck
}

// QueryRow wraps pgx.Tx.QueryRow.
func (tx *Tx) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	return tx.t.QueryRow(ctx, sql, args...)
}

// Conn wraps pgx.Tx.Conn.
func (tx *Tx) Conn() *pgx.Conn {
	return tx.t.Conn()
}
