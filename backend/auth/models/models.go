package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// PartyOfIdentity returns the party ID of the given identity.
func PartyOfIdentity(
	ctx context.Context, tx pgx.Tx, identity int,
) (int, error) {
	var partyID int

	err := tx.QueryRow(
		ctx,
		// coalesce is used to return 0 if the identity is not a party member
		// it also handled the case where the identity is 0 (system)
		"SELECT coalesce(auth.party_of_identity($1),0)",
		identity,
	).Scan(&partyID)
	if err != nil {
		return 0, fmt.Errorf("failed to get party of identity: %w", err)
	}

	return partyID, nil
}
