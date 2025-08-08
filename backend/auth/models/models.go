package models

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// The models package is a collection of methods for working with the database.

// GetEntityOfCredentials gets the entity ID associated to the given credentials, as well as the
// external ID of an identity obtained as a result of logging in as this entity.
func GetEntityOfCredentials(
	ctx context.Context,
	tx pgx.Tx,
	clientID string,
	clientSecret string,
) (int, string, error) {
	var (
		entityID int
		eid      string
	)

	err := tx.QueryRow(
		ctx,
		"select entity_id, external_id from auth.entity_of_credentials($1, $2)",
		clientID,
		clientSecret,
	).Scan(&entityID, &eid)
	if err != nil {
		return -1, "", fmt.Errorf("failed to get identity of credentials: %w", err)
	}

	return entityID, eid, nil
}

// GetExternalIDByEntityID gets the external ID of an entity.
func GetExternalIDByEntityID(
	ctx context.Context,
	tx pgx.Tx,
	entityID int,
) (string, error) {
	var eid string

	err := tx.QueryRow(
		ctx,
		"select flex.identity_external_id($1, null)",
		entityID,
	).Scan(&eid)
	if err != nil {
		return "", fmt.Errorf("failed to get external ID by entity ID: %w", err)
	}

	return eid, nil
}

// GetEntityOfBusinessID gets the entity and external ID of a entity business id.
func GetEntityOfBusinessID(
	ctx context.Context,
	tx pgx.Tx,
	businessID string,
	businessIDType string,
) (int, string, error) {
	var (
		entityID int
		eid      string
	)

	err := tx.QueryRow(
		ctx,
		"select entity_id, external_id from auth.entity_of_business_id($1, $2)",
		businessID,
		businessIDType,
	).Scan(&entityID, &eid)
	if err != nil {
		return -1, "", fmt.Errorf("failed to get entity: %w", err)
	}

	return entityID, eid, nil
}

// GetEntityClientByUUID gets the entity, external ID and PEM public key of an
// entity client identified by its UUID.
func GetEntityClientByUUID(
	ctx context.Context,
	tx pgx.Tx,
	clientID string,
) (int, string, string, error) {
	var (
		entityID       int
		eid, pubKeyPEM string
	)

	err := tx.QueryRow(
		ctx,
		"select entity_id, external_id, client_public_key"+
			" from auth.entity_client_by_uuid($1)",
		clientID,
	).Scan(&entityID, &eid, &pubKeyPEM)
	if err != nil {
		return -1, "", "", fmt.Errorf("failed to get entity: %w", err)
	}

	return entityID, eid, pubKeyPEM, nil
}

// AssumeParty checks if a entity is allowed to assume a party and returns details.
func AssumeParty(
	ctx context.Context,
	tx pgx.Tx,
	partyID int,
) (string, string, []string, int, error) {
	var (
		eid      string
		role     string
		scopes   []string
		entityID int
	)

	err := tx.QueryRow(
		ctx,
		`select eid, role, scopes, entity_id from auth.assume_party($1)`,
		partyID,
	).Scan(&eid, &role, &scopes, &entityID)
	if err != nil {
		return "", "", nil, 0, fmt.Errorf("failed to assume party %d for entity %d: %w", partyID, entityID, err)
	}

	return eid, role, scopes, entityID, nil
}

// UserInfo is a struct that holds the current user info.
type UserInfo struct {
	IdentityID int     `db:"identity_id"`
	ExternalID string  `db:"external_id"`
	EntityID   int     `db:"entity_id"`
	EntityName string  `db:"entity_name"`
	PartyID    *int    `db:"party_id"`
	PartyName  *string `db:"party_name"`
}

// GetCurrentUserInfo returns the current user info.
func GetCurrentUserInfo(ctx context.Context, tx pgx.Tx) (UserInfo, error) {
	var ui UserInfo

	err := tx.QueryRow(
		ctx,
		`select
			identity_id,
			external_id,
			entity_id,
			entity_name,
			party_id,
			party_name
		from auth.current_user_info()`,
	).Scan(&ui.IdentityID, &ui.ExternalID, &ui.EntityID, &ui.EntityName, &ui.PartyID, &ui.PartyName)
	if err != nil {
		return ui, fmt.Errorf("failed to userinfo: %w", err)
	}

	return ui, nil
}

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

//

const getPartyMembership = `select
	p.id as party_id,
	e.id as entity_id
from flex.entity e
inner join flex.party_membership pm on pm.entity_id = e.id
inner join flex.party p on pm.party_id = p.id
where e.id = $1
and p.business_id = $2`

// GetPartyMembership returns the party ID of the given party GLN if the given
// entity belongs to it.
func GetPartyMembership(
	ctx context.Context,
	tx pgx.Tx,
	entityID int,
	partyBusinessID string,
) (int, error) {
	var partyID int

	err := tx.QueryRow(
		ctx,
		getPartyMembership,
		entityID,
		partyBusinessID,
	).Scan(&partyID, &entityID)
	if err != nil {
		return 0, fmt.Errorf("failed to get party membership: %w", err)
	}

	return partyID, nil
}
