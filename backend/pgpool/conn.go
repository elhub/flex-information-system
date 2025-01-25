package pgpool

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// TransactionScopedSettings is a struct that holds the required transaction scoped settings.
type TransactionScopedSettings struct {
	IdentityID int
	EntityID   int
	PartyID    int
}

// Conn is a wrapper around pgxpool.Conn.
type Conn struct {
	pgxc   *pgxpool.Conn
	ctxKey string
}

// Begin starts a transaction block.
// We are defaulting transaction options and setting the
// transaction scoped settings before returning.
func (c *Conn) Begin(ctx context.Context) (pgx.Tx, error) {
	userDetails, err := UserDetailsFromContext(ctx, c.ctxKey)
	if err != nil {
		return nil, fmt.Errorf("error getting user details from context: %w", err)
	}

	txOptions := pgx.TxOptions{
		AccessMode:     pgx.ReadWrite,
		IsoLevel:       pgx.ReadCommitted,
		DeferrableMode: "",
		BeginQuery:     "",
		CommitQuery:    "",
	}
	tx, err := c.pgxc.BeginTx(ctx, txOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}

	eid := userDetails.ExternalID()

	if eid != "" {
		if eid == "0" {
			// the user is using a system role
			_, err = tx.Exec(
				ctx,
				`select
					set_config('flex.current_entity', '0', true),
					set_config('flex.current_party', '0', true),
					set_config('flex.current_identity', '0', true)`,
			)
		} else {
			// the user is using a role with a proper existing identity
			_, err = tx.Exec(
				ctx,
				`select
			set_config('flex.current_entity', entity_id::text, true),
			set_config('flex.current_party', party_id::text, true),
			set_config('flex.current_identity', id::text, true)
			from auth.eid_details($1)`,
				eid,
			)
		}
		if err != nil {
			_ = tx.Rollback(ctx)
			return nil, fmt.Errorf("failed to set transaction scoped settings: %w", err)
		}
	}

	return tx, nil
}

// Release releases the connection back to the pool.
func (c *Conn) Release() {
	c.pgxc.Release()
}
