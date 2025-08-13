// Package pgpool provides a database pool and methods to interact with the database.
//
// It is a thin wrapper around the pgxpool package to enforce that we set up connection
// and transactions in a way that the database expects.
// More specifically it mimics the behavior of PostgREST.
//
// We ensure:
//  1. Every connection does user impersonation via set role
//     https://docs.postgrest.org/en/v12/references/auth.html#user-impersonation
//     https://www.postgresql.org/docs/current/sql-set-role.html
//  2. Every transaction sets the required transaction scoped settings we use in RLS
//     https://docs.postgrest.org/en/v12/references/transactions.html
//
// We achieve this by wrapping the `pgxpool.Pool` and `pgxpool.Conn`
// and only exposing a few methods where we include our magic.
//
// The pool requires that for role and external id is available as `UserDetails` in the context.
package pgpool

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool is a wrapper around pgxpool.Pool.
type Pool struct {
	pgxp   *pgxpool.Pool
	ctxKey string
}

// New creates a new Pool. See pgxpool.ParseConfig for the connString format.
func New(ctx context.Context, connString string, ctxKey string) (*Pool, error) {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("could not parse config: %w", err)
	}

	config.AfterRelease = func(conn *pgx.Conn) bool {
		_, err = conn.Exec(
			ctx,
			"reset role",
		)
		if err != nil {
			slog.InfoContext(ctx, "failed to reset role", "error", err)
			// destroy the connection
			return false
		}

		// return the connection to the pool
		return true
	}

	pgxp, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create db pool: %w", err)
	}

	pool := Pool{pgxp: pgxp, ctxKey: ctxKey}

	return &pool, nil
}

// Close closes all connections in the pool by calling pgxpool.Pool.Close().
func (p *Pool) Close() {
	p.pgxp.Close()
}

// Acquire returns a connection (*Conn) from the Pool after setting the role.
func (p *Pool) Acquire(ctx context.Context) (*Conn, error) {
	userDetails, err := UserDetailsFromContext(ctx, p.ctxKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get user details from context: %w", err)
	}

	role := userDetails.Role()

	slog.InfoContext(ctx, "acquiring connection for role", "role", role)

	acquireCtx, cancel := context.WithTimeout(ctx, 5*time.Second) //nolint:mnd
	defer cancel()

	conn, err := p.pgxp.Acquire(acquireCtx)
	if err != nil {
		return nil, fmt.Errorf("failed to acquire connection for role %s: %w", role, err)
	}

	_, err = conn.Exec(
		ctx,
		"set role to "+role,
	)
	if err != nil {
		conn.Release()
		return nil, fmt.Errorf("failed to set role to %s: %w", role, err)
	}

	return &Conn{pgxc: conn, ctxKey: p.ctxKey}, nil
}

// Begin acquires a connection from the Pool and starts a transaction.
func (p *Pool) Begin(
	ctx context.Context,
) (pgx.Tx, error) {
	conn, err := p.Acquire(ctx)
	if err != nil {
		return nil, err
	}

	tx, err := conn.Begin(ctx)
	if err != nil {
		conn.Release()
		return nil, err
	}

	return &Tx{t: tx, c: conn}, nil
}
