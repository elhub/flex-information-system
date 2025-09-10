package models

import (
	"context"
	"flex/auth/scope"
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
) (int, string, []string, error) {
	var (
		entityID int
		eid      string
		scopes   []string
	)

	err := tx.QueryRow(
		ctx,
		"select entity_id, external_id, scopes from auth.entity_of_credentials($1, $2)",
		clientID,
		clientSecret,
	).Scan(&entityID, &eid, &scopes)
	if err != nil {
		return -1, "", nil, fmt.Errorf("failed to get identity of credentials: %w", err)
	}

	return entityID, eid, scopes, nil
}

// GetEntityIdentityByExternalID returns an identity corresponding to the same
// entity and client as the identity given as parameter, but without party
// association.
func GetEntityIdentityByExternalID(
	ctx context.Context,
	tx pgx.Tx,
	externalID string,
) (string, *string, scope.List, error) {
	var (
		eid          string
		clientID     *string
		scopeStrings []string
	)

	err := tx.QueryRow(
		ctx,
		"select external_id, client_id, scopes from auth.entity_identity_of_external_id($1)",
		externalID,
	).Scan(&eid, &clientID, &scopeStrings)
	if err != nil {
		return "", nil, nil, fmt.Errorf("failed to refresh identity without party: %w", err)
	}

	scopes, err := scope.ListFromStrings(scopeStrings)
	if err != nil {
		return "", nil, nil, fmt.Errorf("failed to parse scopes: %w", err)
	}

	return eid, clientID, scopes, nil
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
) (int, string, string, scope.List, error) {
	var (
		entityID       int
		eid, pubKeyPEM string
		scopeStrings   []string
	)

	err := tx.QueryRow(
		ctx,
		"select entity_id, external_id, client_public_key, scopes"+
			" from auth.entity_client_by_uuid($1)",
		clientID,
	).Scan(&entityID, &eid, &pubKeyPEM, &scopeStrings)
	if err != nil {
		return -1, "", "", nil, fmt.Errorf("failed to get entity: %w", err)
	}

	if scopeStrings == nil {
		return entityID, eid, pubKeyPEM, nil, nil
	}

	scopes, err := scope.ListFromStrings(scopeStrings)
	if err != nil {
		return -1, "", "", nil, fmt.Errorf("failed to parse scopes: %w", err)
	}

	return entityID, eid, pubKeyPEM, scopes, nil
}

// AssumeParty checks if a entity is allowed to assume a party and returns details.
// Scopes are returned when the party is assumed through membership.
func AssumeParty(
	ctx context.Context,
	tx pgx.Tx,
	partyID int,
) (string, string, scope.List, int, error) {
	var (
		eid          string
		role         string
		scopeStrings []string
		entityID     int
	)

	err := tx.QueryRow(
		ctx,
		`select eid, role, scopes, entity_id from auth.assume_party($1)`,
		partyID,
	).Scan(&eid, &role, &scopeStrings, &entityID)
	if err != nil {
		return "", "", nil, 0, fmt.Errorf("failed to assume party %d for entity %d: %w", partyID, entityID, err)
	}

	if scopeStrings == nil {
		return eid, role, nil, entityID, nil
	}

	scopes, err := scope.ListFromStrings(scopeStrings)
	if err != nil {
		return "", "", nil, 0, fmt.Errorf("failed to parse scopes: %w", err)
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

const getAssumablePartyIDFromGLN = `select
	p.id as party_id
from flex.entity as e
	inner join flex.party_membership as pm on e.id = pm.entity_id
	inner join flex.party as p on pm.party_id = p.id
where e.id = $1
	and p.business_id = $2
union all
select
	p.id as party_id
from flex.party as p
where p.entity_id = $1
	and p.business_id = $2
limit 1`

// GetAssumablePartyIDFromGLN returns the party ID of the given party GLN if the
// given entity can assume it (i.e., owns it or is a member of it).
func GetAssumablePartyIDFromGLN(
	ctx context.Context,
	tx pgx.Tx,
	entityID int,
	partyBusinessID string,
) (int, error) {
	var partyID int

	err := tx.QueryRow(
		ctx,
		getAssumablePartyIDFromGLN,
		entityID,
		partyBusinessID,
	).Scan(&partyID)
	if err != nil {
		return 0, fmt.Errorf("failed to get party ID: %w", err)
	}

	return partyID, nil
}
