package auth

import (
	"context"
	"encoding/json"
	"flex/auth/models"
	"flex/auth/scope"
	"flex/pgpool"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/lestrrat-go/jwx/v4/jwa"
	"github.com/lestrrat-go/jwx/v4/jws"
)

const (
	sessionCookieKey                = "__Host-flex_session"
	defaultFailedLoginResponseDelay = 2 * time.Second
	maxRequestBodyBytes             = 1024
)

// API holds the authentication API handlers.
type API struct {
	db                       *pgpool.Pool
	jwtSecret                []byte
	tokenDurationSeconds     int
	ctxKey                   string
	failedLoginResponseDelay time.Duration // delay inside the handler on failed login
	defaultAnonymousScopes   scope.List    // default scopes for an anonymous user
	defaultEntityScopes      scope.List    // default scopes for an entity user
	defaultOwnedPartyScopes  scope.List    // default scopes for a user assuming an owned party
}

// NewAPI creates a new auth.API instance.
func NewAPI(
	db *pgpool.Pool,
	jwtSecret string,
	ctxKey string,
	isLoginLimitingDisabled bool,
) *API {
	// default login limiting
	failedLoginResponseDelay := defaultFailedLoginResponseDelay

	return &API{
		db:                       db,
		jwtSecret:                []byte(jwtSecret),
		tokenDurationSeconds:     3600,
		ctxKey:                   ctxKey,
		failedLoginResponseDelay: failedLoginResponseDelay,
		defaultAnonymousScopes: scope.List{
			// TODO limit the scope a bit?
			scope.Scope{Verb: scope.Use, Asset: "auth"},  // to be able to log in
			scope.Scope{Verb: scope.Read, Asset: "data"}, // to be able to access open data (if any)
		},
		defaultEntityScopes: scope.List{
			scope.Scope{Verb: scope.Manage, Asset: "auth"}, // to be able to assume party
			scope.Scope{Verb: scope.Manage, Asset: "data"}, // to be able to access their data
			scope.Scope{Verb: scope.Read, Asset: "grid"},
			scope.Scope{Verb: scope.Manage, Asset: "attachment"},
		},
		defaultOwnedPartyScopes: scope.List{ // full read-write access
			scope.Scope{Verb: scope.Manage, Asset: "auth"},
			scope.Scope{Verb: scope.Manage, Asset: "data"},
			scope.Scope{Verb: scope.Read, Asset: "grid"},
			scope.Scope{Verb: scope.Manage, Asset: "attachment"},
		},
	}
}

// TokenDecodingMiddleware decodes the token and sets it as RequestDetails in the context.
//
//nolint:funlen
func (auth *API) TokenDecodingMiddleware(
	next http.Handler,
) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		authHeader := req.Header.Get("Authorization")
		sessionCookie, err := req.Cookie(sessionCookieKey)

		ctx := req.Context()

		if authHeader == "" && err != nil {
			// Empty auth header and missing cookie means anonymous user.
			rd := &RequestDetails{
				role:       "flex_anonymous",
				externalID: "",
				scope:      auth.defaultAnonymousScopes,
			}
			authenticatedCtx := context.WithValue(ctx, auth.ctxKey, rd) //nolint:revive,staticcheck
			slog.InfoContext(ctx, "no auth header/cookie: user will be anonymous")
			next.ServeHTTP(w, req.WithContext(authenticatedCtx))

			return
		}

		// the authorization header takes precedence over the cookie
		var tokenStr string

		if authHeader != "" {
			var found bool

			tokenStr, found = strings.CutPrefix(authHeader, "Bearer ")
			if !found {
				w.Header().Set(
					wwwAuthenticateKey,
					wwwAuthenticate{
						Error:            wwwInvalidRequest,
						ErrorDescription: "missing Bearer in Authorization header",
					}.String(),
				)
				writeJSON(w, http.StatusBadRequest, oauthErrorMessage{
					Error:            oauthErrorInvalidRequest,
					ErrorDescription: "missing Bearer in Authorization header",
				})

				return
			}

			slog.DebugContext(ctx, "found token in auth header")
		} else { // no authorization header means we must use the cookie
			tokenStr = sessionCookie.Value

			slog.DebugContext(ctx, "found token in cookie")

			// we set the header for cases where the request is proxied or forwarded
			// to another upstream service
			req.Header.Set("Authorization", "Bearer "+tokenStr)
		}

		token, err := auth.decodeTokenString(tokenStr)
		if err != nil {
			w.Header().Set(
				wwwAuthenticateKey,
				wwwAuthenticate{
					Error: wwwInvalidToken,
					// TODO the error messages here is incorrect if we are using a session
					ErrorDescription: "invalid bearer token",
				}.String(),
			)
			writeJSON(w, http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidRequest,
				ErrorDescription: "unable to verify and validate token",
			})
			slog.InfoContext(ctx, "invalid token")

			return
		}

		rd := &RequestDetails{
			role:       token.Role,
			externalID: token.ExternalID,
			scope:      token.Scope,
		}
		authenticatedCtx := context.WithValue(ctx, auth.ctxKey, rd) //nolint:revive,staticcheck
		slog.InfoContext(
			ctx, "token-validated user",
			"role", token.Role,
			"externalID", token.ExternalID,
			"scope", token.Scope,
		)
		next.ServeHTTP(w, req.WithContext(authenticatedCtx))
	})
}

// writeJSON writes a JSON response with the given object as body.
func writeJSON(w http.ResponseWriter, statusCode int, obj any) {
	w.Header().Set("Content-Type", "application/json")

	body, _ := json.Marshal(obj) //nolint:errchkjson

	w.WriteHeader(statusCode)
	w.Write(body)
}

// sessionInfo is the response from assume and session.
type sessionInfo struct {
	EntityID       int      `json:"entity_id"`
	EntityName     string   `json:"entity_name"`
	ExpirationTime unixTime `json:"exp"`
	PartyID        int      `json:"party_id,omitempty"`
	PartyName      string   `json:"party_name,omitempty"`
	Role           string   `json:"role"`
}

// PostAssumeHandler handles the assume role in the BFF.
//
//nolint:funlen,cyclop
func (auth *API) PostAssumeHandler(w http.ResponseWriter, r *http.Request) {
	accessTokenCookie, err := r.Cookie(sessionCookieKey)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "missing session cookie",
		})
		w.Write(body)

		return
	}

	entityToken := new(accessToken)

	err = verifyTokenString(accessTokenCookie.Value, entityToken, jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "invalid session cookie",
		})
		w.Write(body)

		return
	}

	entityScopes := entityToken.Scope

	w.Header().Set("Content-Type", "application/json")

	if r.Header.Get("Content-Type") != "application/x-www-form-urlencoded" {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "invalid content type",
		})
		w.Write(body)

		return
	}

	ctx := r.Context()

	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBodyBytes)

	partyIDstr := r.FormValue("party_id")
	if partyIDstr == "" {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "party_id is required",
		})
		w.Write(body)

		return
	}

	partyID, err := strconv.Atoi(partyIDstr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "party_id must be an integer",
		})
		w.Write(body)

		return
	}

	tx, err := auth.db.Begin(ctx)
	if err != nil {
		slog.WarnContext(ctx, "error in begin tx in assume role handler", "error", err)
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not begin tx",
		})
		w.Write(body)

		return
	}
	defer tx.Commit(ctx)

	_, clientID, _, err := models.GetEntityIdentityByExternalID(ctx, tx, entityToken.ExternalID)
	if err != nil {
		slog.WarnContext(ctx, "error in get entity identity by external ID in assume role handler", "error", err)
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not get entity identity in assume handler",
		})
		w.Write(body)

		return
	}

	// only persons authenticating in the browser are allowed to assume a party
	// entity_clients should use token exchange
	if clientID != nil {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidClient,
			ErrorDescription: "client is not allowed to assume a party",
		})
		w.Write(body)

		return
	}

	eid, role, partyScopes, entityID, err := models.AssumeParty(ctx, tx, partyID)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidTarget,
			ErrorDescription: "cannot assume requested party",
		})
		w.Write(body)

		return
	}

	if partyScopes == nil { // assuming an owned party
		partyScopes = auth.defaultOwnedPartyScopes
	}

	scopes := scope.ListIntersection(entityScopes, partyScopes)

	partyToken := accessToken{
		ExpirationTime: entityToken.ExpirationTime,
		Role:           role,
		PartyID:        partyID,
		EntityID:       entityID,
		ExternalID:     eid,
		Scope:          scopes,
	}

	signedPartyToken, err := partyToken.Sign(jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not sign party token",
		})
		w.Write(body)

		return
	}

	// assuming party is done, so we can "log in" with a new transaction
	rd := &RequestDetails{role: role, externalID: eid, scope: scopes}
	ctx = context.WithValue(ctx, auth.ctxKey, rd) //nolint:revive,staticcheck
	_ = tx.Commit(ctx)
	tx, err = auth.db.Begin(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not begin tx",
		})
		w.Write(body)

		return
	}
	defer tx.Commit(ctx)

	ui, err := models.GetCurrentUserInfo(ctx, tx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not get current user info",
		})
		w.Write(body)

		return
	}

	partyName := ""
	if ui.PartyName != nil {
		partyName = *ui.PartyName
	}

	http.SetCookie(w, &http.Cookie{ //nolint:exhaustruct
		Name:     sessionCookieKey,
		Value:    string(signedPartyToken),
		Path:     "/",
		MaxAge:   int(time.Until(partyToken.ExpirationTime.Time).Seconds()),
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})
	w.WriteHeader(http.StatusOK)

	body, _ := json.Marshal(sessionInfo{ //nolint:errchkjson
		EntityID:       entityID,
		EntityName:     ui.EntityName,
		ExpirationTime: entityToken.ExpirationTime,
		PartyID:        partyID,
		PartyName:      partyName,
		Role:           role,
	})
	w.Write(body)
}

// DeleteAssumeHandler handles the unassuming of a party.
//
//nolint:funlen
func (auth *API) DeleteAssumeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	accessTokenCookie, err := r.Cookie(sessionCookieKey)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "missing session cookie",
		})
		w.Write(body)

		return
	}

	receivedToken := new(accessToken)

	err = verifyTokenString(accessTokenCookie.Value, receivedToken, jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "invalid session cookie",
		})
		w.Write(body)

		return
	}

	if receivedToken.PartyID == 0 {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "session cookie is already a bare entity",
		})
		w.Write(body)

		return
	}

	tx, err := auth.db.Begin(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not begin tx",
		})
		w.Write(body)

		return
	}
	defer tx.Commit(r.Context())

	externalID, clientID, scopes, err := models.GetEntityIdentityByExternalID(
		r.Context(), tx, receivedToken.ExternalID,
	)

	canUnassume, err := models.CanEntityClientUnassume(
		r.Context(), tx, receivedToken.ExternalID,
	)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not check if party can be unassumed",
		})
		w.Write(body)

		return
	}
	if !canUnassume {
		w.WriteHeader(http.StatusBadRequest)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "party cannot be unassumed",
		})
		w.Write(body)

		return
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not get entity identity",
		})
		w.Write(body)

		return
	}

	// if the identity did not log in with an entity client, use default scopes
	if clientID == nil {
		scopes = auth.defaultEntityScopes
	}

	ui, err := models.GetCurrentUserInfo(r.Context(), tx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not get current user info",
		})
		w.Write(body)

		return
	}

	entityToken := accessToken{
		ExpirationTime: receivedToken.ExpirationTime,
		Role:           "flex_entity",
		PartyID:        0,
		EntityID:       receivedToken.EntityID,
		ExternalID:     externalID,
		Scope:          scopes,
	}

	signedEntityToken, err := entityToken.Sign(jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		body, _ := json.Marshal(oauthErrorMessage{
			Error:            oauthErrorServerError,
			ErrorDescription: "could not sign party token",
		})
		w.Write(body)

		return
	}

	http.SetCookie(w, &http.Cookie{ //nolint:exhaustruct
		Name:     sessionCookieKey,
		Value:    string(signedEntityToken),
		Path:     "/",
		MaxAge:   int(time.Until(entityToken.ExpirationTime.Time).Seconds()),
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})
	w.WriteHeader(http.StatusOK)

	body, _ := json.Marshal(sessionInfo{ //nolint:errchkjson,exhaustruct
		EntityID:       receivedToken.EntityID,
		EntityName:     ui.EntityName,
		ExpirationTime: entityToken.ExpirationTime,
		Role:           "flex_entity",
	})
	w.Write(body)
}

// decodeTokenString decodes the token string and returns the claims.
// Returns an error if the token was not verified or validated.
func (auth *API) decodeTokenString(tokenStr string) (*accessToken, error) {
	token := new(accessToken)

	err := verifyTokenString(tokenStr, token, jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("error in verifying access token: %w", err)
	}

	if err := token.Validate(); err != nil {
		return nil, fmt.Errorf("error in validating access token: %w", err)
	}

	return token, nil
}
