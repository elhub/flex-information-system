package auth

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"flex/auth/models"
	"flex/auth/oidc"
	"flex/auth/scope"
	"flex/internal/validate"
	"flex/pgpool"
	"fmt"
	"log/slog"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jws"
	"github.com/lestrrat-go/jwx/v3/jwt"
	"github.com/lestrrat-go/jwx/v3/jwt/openid"
)

const (
	callbackPath     = "/auth/v0/callback"
	sessionCookieKey = "__Host-flex_session"

	defaultFailedLoginResponseDelay = 2 * time.Second

	defaultLoginDelayerDurationBeforeReset  = 1 * time.Hour
	defaultLoginDelayerMaxFailedLogins      = 20
	defaultLoginDelayerNbLoginsWithoutDelay = 5
	defaultLoginDelayerBaseDelay            = 2 * time.Minute
	defaultLoginDelayerDelayIncreaseFactor  = 1.1
	defaultLoginDelayerMaxDelay             = 1 * time.Hour
)

// API holds the authentication API handlers.
type API struct {
	// self is the api service itself.
	// Used as the issuer of access tokens and to validate the audience of incoming tokens.
	self                     string
	db                       *pgpool.Pool
	jwtSecret                []byte
	tokenDurationSeconds     int
	oidcProvider             *oidc.Provider
	ctxKey                   string
	failedLoginResponseDelay time.Duration // delay inside the handler on failed login
	loginDelayer             *IPLoginDelayer
	defaultAnonymousScopes   scope.List // default scopes for an anonymous user
	defaultEntityScopes      scope.List // default scopes for an entity user
	defaultOwnedPartyScopes  scope.List // default scopes for a user assuming an owned party
}

// NewAPI creates a new auth.API instance.
func NewAPI(
	self string,
	db *pgpool.Pool,
	jwtSecret string,
	oidcProvider *oidc.Provider,
	ctxKey string,
	isLoginLimitingDisabled bool,
) *API {
	// default login limiting
	failedLoginResponseDelay := defaultFailedLoginResponseDelay
	loginDelayerConfig := LoginDelayerConfig{
		DurationBeforeReset:  defaultLoginDelayerDurationBeforeReset,
		MaxFailedLogins:      defaultLoginDelayerMaxFailedLogins,
		NbLoginsWithoutDelay: defaultLoginDelayerNbLoginsWithoutDelay,
		BaseDelay:            defaultLoginDelayerBaseDelay,
		DelayIncreaseFactor:  defaultLoginDelayerDelayIncreaseFactor,
		MaxDelay:             defaultLoginDelayerMaxDelay,
	}

	if isLoginLimitingDisabled {
		failedLoginResponseDelay = 0
		// A zero-delay delayer would make it impossible to test login delay.
		// Here, we use something lax enough to be able to run all our API tests,
		// but still finite, so that if we run requests in a loop, it will
		// eventually block.
		loginDelayerConfig = LoginDelayerConfig{
			DurationBeforeReset:  5 * time.Second,
			MaxFailedLogins:      6,
			NbLoginsWithoutDelay: 2,
			BaseDelay:            500 * time.Millisecond,
			DelayIncreaseFactor:  2,
			MaxDelay:             2 * time.Second,
		}
	}

	loginDelayer := NewIPLoginDelayer(loginDelayerConfig)

	return &API{
		self:                     self,
		db:                       db,
		jwtSecret:                []byte(jwtSecret),
		tokenDurationSeconds:     3600,
		oidcProvider:             oidcProvider,
		ctxKey:                   ctxKey,
		failedLoginResponseDelay: failedLoginResponseDelay,
		loginDelayer:             loginDelayer,
		defaultAnonymousScopes: scope.List{
			// TODO limit the scope a bit?
			scope.Scope{Verb: scope.Use, Asset: "auth"},  // to be able to log in
			scope.Scope{Verb: scope.Read, Asset: "data"}, // to be able to access open data (if any)
		},
		defaultEntityScopes: scope.List{
			scope.Scope{Verb: scope.Manage, Asset: "auth"}, // to be able to assume party
			scope.Scope{Verb: scope.Manage, Asset: "data"}, // to be able to access their data
		},
		defaultOwnedPartyScopes: scope.List{ // full read-write access
			scope.Scope{Verb: scope.Manage, Asset: "auth"},
			scope.Scope{Verb: scope.Manage, Asset: "data"},
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

// tokenPayload is used to inspect the grant type in the token request.
type tokenPayload struct {
	GrantType grantType `binding:"required" form:"grant_type"`
}

// tokenResponse is the response containing the access token.
type tokenResponse struct {
	// NB (linter ignore): this is a response struct, not a hardcoded secret
	AccessToken     string          `json:"access_token"` //nolint:gosec
	IssuedTokenType tokenType       `json:"issued_token_type"`
	TokenType       accessTokenType `json:"token_type"`
	ExpiresIn       int             `json:"expires_in"`
}

// PostTokenHandler handles the token exchange and client credentials calls.
func (auth *API) PostTokenHandler(ctx *gin.Context) {
	var tokenPayload tokenPayload

	err := ctx.ShouldBindWith(&tokenPayload, binding.FormPost)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "no grant_type in request",
		})

		return
	}

	switch tokenPayload.GrantType {
	case grantTypeClientCredentials:
		var ccPayload clientCredentialsPayload

		err := ctx.ShouldBindWith(&ccPayload, binding.FormPost)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidRequest,
				ErrorDescription: "bad client credentials request: " + err.Error(),
			})
		} else {
			auth.clientCredentialsHandler(ctx, ccPayload)
		}
	case grantTypeTokenExchange:
		var tePayload tokenExchangePayload

		err := ctx.ShouldBindWith(&tePayload, binding.FormPost)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidRequest,
				ErrorDescription: "bad token exchange request: " + err.Error(),
			})
		} else {
			auth.tokenExchangeHandler(ctx, tePayload)
		}
	case grantTypeJWTBearer:
		var jwtPayload jwtBearerPayload

		err := ctx.ShouldBindWith(&jwtPayload, binding.FormPost)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidRequest,
				ErrorDescription: "bad jwt bearer request: " + err.Error(),
			})
		} else {
			auth.jwtBearerHandler(ctx, jwtPayload)
		}
	default:
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorUnsupportedGrantType,
			ErrorDescription: fmt.Sprintf("unsupported grant type: %s", tokenPayload.GrantType),
		})
	}
}

// GetSessionHandler checks the session cookie and returns the session information including the access_token if the session is valid.
//
//nolint:funlen
func (auth *API) GetSessionHandler(w http.ResponseWriter, r *http.Request) {
	sessionCookie, err := r.Cookie(sessionCookieKey)
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			// Missing cookie just means that there is no session,
			// so returning empty response with 204 No Content makes sense.
			w.WriteHeader(http.StatusNoContent)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			body, _ := json.Marshal(newErrorMessage(http.StatusInternalServerError, "unknown error when getting cookie", err))
			// NB (linter ignore): body is a JSON error message, not user-controlled
			w.Write(body) //nolint:gosec
		}

		return
	}

	accessTokenString := sessionCookie.Value

	// TODO actually implement a opaque session cookie that is backed by a (unlogged) database table or something.

	w.Header().Set("Content-Type", "application/json")

	accessToken, err := auth.decodeTokenString(accessTokenString)
	if err != nil {
		// Unset the session cookie
		http.SetCookie(w, &http.Cookie{ //nolint:exhaustruct
			Name:     sessionCookieKey,
			Value:    "not.a.session",
			MaxAge:   -1,
			Path:     "/",
			Secure:   true,
			HttpOnly: true,
			SameSite: http.SameSiteStrictMode,
		})
		w.WriteHeader(http.StatusBadRequest)
		body, _ := json.Marshal(newErrorMessage(http.StatusBadRequest, "invalid session cookie", err))
		// NB (linter ignore): body is a JSON error message, not user-controlled
		w.Write(body) //nolint:gosec

		return
	}

	ctx := r.Context()

	tx, err := auth.db.Begin(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		body, _ := json.Marshal(newErrorMessage(http.StatusInternalServerError, "could not begin tx", err))
		// NB (linter ignore): body is a JSON error message, not user-controlled
		w.Write(body) //nolint:gosec

		return
	}
	defer tx.Commit(ctx)

	ui, err := models.GetCurrentUserInfo(ctx, tx)
	if err != nil {
		slog.WarnContext(r.Context(), "error in get current user info", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		body, _ := json.Marshal(newErrorMessage(http.StatusInternalServerError, "could not get current user info", err))
		// NB (linter ignore): body is a JSON error message, not user-controlled
		w.Write(body) //nolint:gosec

		return
	}

	partyName := ""
	if ui.PartyName != nil {
		partyName = *ui.PartyName
	}

	w.WriteHeader(http.StatusOK)

	body, _ := json.Marshal(sessionInfo{ //nolint:errchkjson
		EntityID:       accessToken.EntityID,
		EntityName:     ui.EntityName,
		ExpirationTime: accessToken.ExpirationTime,
		PartyID:        accessToken.PartyID,
		PartyName:      partyName,
		Role:           accessToken.Role,
	})
	w.Write(body)
}

type loginCookie struct {
	*oidc.AuthorizationDetails

	ReturnURL string `json:"return_url"`
}

// GetLoginHandler starts the authorization code flow with the external identity provider.
// It pushes an authorization request to the external identity provider before
// redirecting the user to the external identity provider.
func (auth *API) GetLoginHandler(ctx *gin.Context) {
	url, authDetails, err := auth.oidcProvider.AuthURL(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not get url for authorization server", err))
	}

	returnURL := ctx.Query("return_url")
	if returnURL == "" {
		returnURL = "/#/login/assumeParty"
	}

	if !strings.HasPrefix(returnURL, "/#/") {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "return_url must be a relative path in the frontend", nil))
		return
	}

	loginCookie := loginCookie{
		authDetails,
		returnURL,
	}

	loginCookiePayload, _ := json.Marshal(loginCookie)

	// we don't really need to sign the cookie, but we are doing it just to make sure that there is no tampering
	signedLoginCookie, err := jws.Sign(loginCookiePayload, jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not sign login cookie", err))
		return
	}

	// We need to set lax mode to allow the cookie to be sent when a user is navigating to the origin site from an external site
	ctx.SetSameSite(http.SameSiteLaxMode)

	maxAge := 120
	ctx.SetCookie("flex_login", string(signedLoginCookie), maxAge, callbackPath, "", true, true)

	ctx.Redirect(http.StatusFound, url)
}

// GetCallbackHandler handles the callback from the external identity provider.
// It exchanges the authorization code for an access token and sets the session cookie.
func (auth *API) GetCallbackHandler(ctx *gin.Context) { //nolint:funlen,cyclop
	code := ctx.Query("code")
	if code == "" {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "no code in callback", nil))
		return
	}

	returnedState := ctx.Query("state")
	if returnedState == "" {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "no state in callback", nil))
		return
	}

	issuer := ctx.Query("iss")
	if issuer != "" {
		// Not all IDps send the issuer in the callback, so we ignore it if it is not present.
		// We will check the issuer in the id_token later.
		// If the issuer is present, it must match the issuer of the IDP.
		if issuer != auth.oidcProvider.Issuer() {
			ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "invalid issuer in callback", nil))
			return
		}
	}

	loginCookieStr, err := ctx.Cookie("flex_login")
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "missing login cookie", err))
		return
	}

	loginCookiePayload, err := jws.Verify([]byte(loginCookieStr), jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "invalid cookie", err))
		return
	}

	var loginCookie loginCookie

	err = json.Unmarshal(loginCookiePayload, &loginCookie)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "malformed cookie", err))
		return
	}

	ok, err := auth.oidcProvider.Verify(loginCookie.StateVerifier, returnedState)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "malformed state in callback", err))
		return
	}

	if !ok {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "invalid state in callback", err))
		return
	}

	tokenResponse, err := auth.oidcProvider.Exchange(ctx, code, loginCookie.CodeVerifier)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "error in code exchange", err))
		return
	}

	idToken, ok := tokenResponse.Extra("id_token").(string)
	if !ok {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "no id_token in token response", nil))
		return
	}

	keySet, err := auth.oidcProvider.GetKeySet(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not get key set", err))
		return
	}

	token := openid.New()

	_, err = jwt.ParseString(
		idToken,
		jwt.WithToken(token),
		jwt.WithKeySet(keySet),
		jwt.WithIssuer(auth.oidcProvider.Issuer()),
		jwt.WithAudience(auth.oidcProvider.ClientID()),
	)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "invalid id_token", err))
		return
	}

	var returnedNonce string

	err = token.Get("nonce", &returnedNonce)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "no nonce in id_token", err))
		return
	}

	ok, err = auth.oidcProvider.Verify(loginCookie.NonceVerifier, returnedNonce)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "malformed nonce in callback", err))
		return
	}

	if !ok {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "invalid nonce in callback", err))
		return
	}

	id, idType := oidc.GetIdentifier(token)

	slog.DebugContext(ctx, "callback", "token", idToken, "id", id)

	tx, err := auth.db.Begin(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not begin tx in callback handler", err))
		return
	}
	defer tx.Commit(ctx)

	entityID, eid, err := models.GetEntityOfBusinessID(ctx, tx, id, idType)
	if err != nil {
		slog.DebugContext(ctx, "getting identity of person identifier failed", "token", idToken, "id", id, "idType", idType, "error", err)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidClient,
			ErrorDescription: "you are not a registered user",
		})

		return
	}

	accessToken := accessToken{
		EntityID:       entityID,
		ExpirationTime: newUnixExpirationTime(auth.tokenDurationSeconds),
		ExternalID:     eid,
		PartyID:        0,
		Role:           "flex_entity",
		Scope:          auth.defaultEntityScopes,
	}

	signedAccessToken, err := accessToken.Sign(jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not sign access token", err))
		return
	}

	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie(sessionCookieKey, string(signedAccessToken), auth.tokenDurationSeconds, "/", "", true, true)
	ctx.SetCookie("flex_login", "not.a.login", -1, callbackPath, "", true, true)

	ctx.Redirect(http.StatusFound, loginCookie.ReturnURL)
}

// GetLogoutHandler unsets the __Host-flex_session cookie.
func (auth *API) GetLogoutHandler(ctx *gin.Context) {
	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie(sessionCookieKey, "not.a.session", -1, "/", "", true, true)

	endSessionURL := auth.oidcProvider.EndSessionURL()
	ctx.Redirect(http.StatusFound, endSessionURL)
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

	eid, role, partyScopes, entityID, err := models.AssumeParty(ctx, tx, partyID)
	tx.Commit(ctx)

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

	// assuming party is done, so we can "log in"
	rd := &RequestDetails{role: role, externalID: eid, scope: scopes}
	ctx = context.WithValue(ctx, auth.ctxKey, rd) //nolint:revive,staticcheck

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

// userInfoResponse is the response containing the user information.
type userInfoResponse struct {
	Sub         string  `json:"sub"`
	EntityID    int     `json:"entity_id"`
	EntityName  string  `json:"entity_name"`
	PartyID     *int    `json:"party_id,omitempty"`
	PartyName   *string `json:"party_name,omitempty"`
	CurrentRole string  `json:"current_role"`
}

// GetUserInfoHandler returns the identity information of the current user.
func (auth *API) GetUserInfoHandler(ctx *gin.Context) {
	rd, _ := RequestDetailsFromContextKey(ctx, auth.ctxKey)
	role := rd.Role()

	if role == "flex_anonymous" {
		ctx.Header(
			wwwAuthenticateKey,
			wwwAuthenticate{}.String(), //nolint:exhaustruct
		)
		ctx.AbortWithStatusJSON(
			http.StatusUnauthorized,
			newErrorMessage(
				http.StatusUnauthorized,
				"missing authentication",
				nil,
			),
		)

		return
	}

	tx, err := auth.db.Begin(ctx)
	if err != nil {
		slog.WarnContext(ctx, "error in begin tx in userinfo handler", "error", err)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not begin tx in userinfo handler",
			err),
		)

		return
	}
	defer tx.Rollback(ctx)

	ui, err := models.GetCurrentUserInfo(ctx, tx)
	if err != nil {
		slog.WarnContext(ctx, "error in get current user info", "error", err)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not get current user info",
			err),
		)

		return
	}

	ctx.JSON(http.StatusOK, userInfoResponse{
		Sub:         ui.ExternalID,
		EntityID:    ui.EntityID,
		EntityName:  ui.EntityName,
		PartyID:     ui.PartyID,
		PartyName:   ui.PartyName,
		CurrentRole: role,
	})
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

// clientCredentialsPayload is the payload for the client credentials request.
type clientCredentialsPayload struct {
	GrantType grantType `binding:"required" form:"grant_type"`
	ClientID  string    `binding:"required" form:"client_id"`
	// NB (linter ignore): this is a field in the request, not a hardcoded secret
	ClientSecret string `binding:"required" form:"client_secret"` //nolint:gosec
}

// Validate checks if the client credentials payload is valid.
func (cc clientCredentialsPayload) Validate() error {
	val := validate.New()

	val.Check(cc.GrantType == grantTypeClientCredentials, "invalid grant type")
	val.Check(cc.ClientID != "", "client_id is required")
	val.Check(cc.ClientSecret != "", "client_secret is required")

	return val.Error()
}

func (auth *API) clientCredentialsHandler( //nolint:funlen
	ctx *gin.Context,
	payload clientCredentialsPayload,
) {
	slog.InfoContext(ctx, "client credentials for client", "client", payload.ClientID)

	err := payload.Validate()
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: err.Error(),
		})

		return
	}

	tx, err := auth.db.Begin(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not begin tx in client credentials handler",
			err),
		)

		return
	}
	defer tx.Commit(ctx)

	delayer := auth.loginDelayer.GetDelayerFromIP(ctx.Request.RemoteAddr)

	if !delayer.Allow(ctx) {
		ctx.Header(
			"Retry-After",
			strconv.Itoa(int(math.Ceil(time.Until(delayer.MinTimeForNextRequest()).Seconds()))),
		)
		ctx.AbortWithStatusJSON(http.StatusTooManyRequests, oauthErrorMessage{
			Error:            oauthErrorAccessDenied,
			ErrorDescription: "too many login attempts, try again later",
		})

		return
	}

	entityID, eid, scopeStrings, err := models.GetEntityOfCredentials(
		ctx, tx, payload.ClientID, payload.ClientSecret,
	)
	if err != nil {
		time.Sleep(auth.failedLoginResponseDelay)

		slog.InfoContext(ctx, "getting identity of credentials failed: ", "error", err)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidClient,
			ErrorDescription: "Invalid client_id or client_secret",
		})

		return
	}

	// this makes sure valid logins are not delayed
	delayer.Cancel()

	scopes, err := scope.ListFromStrings(scopeStrings)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"invalid scope format from database",
			err,
		))

		return
	}

	accessToken := accessToken{
		EntityID:       entityID,
		ExpirationTime: newUnixExpirationTime(auth.tokenDurationSeconds),
		ExternalID:     eid,
		PartyID:        0,
		Role:           "flex_entity",
		Scope:          scopes,
	}

	slog.InfoContext(
		ctx, "successful client credentials login",
		"entity", entityID, "eid", eid,
	)

	signedAccessToken, err := accessToken.Sign(jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not sign access token",
			err),
		)

		return
	}

	// NB (linter ignore): no credentials hardcoded
	//nolint:gosec
	ctx.JSON(http.StatusOK, gin.H{
		"access_token":      string(signedAccessToken),
		"issued_token_type": "urn:ietf:params:oauth:token-type:jwt",
		"token_type":        "Bearer",
		"expires_in":        auth.tokenDurationSeconds,
	})
}

// ---- token exchange phase.
var errInvalidScope = errors.New("invalid scope")

func scopeToPartyID(scope string) (int, error) {
	assumePartyIDStr, found := strings.CutPrefix(scope, "assume:party:")
	if !found {
		return 0, fmt.Errorf("%w: does not start with 'assume:party:'", errInvalidScope)
	}

	assumePartyID, err := strconv.Atoi(assumePartyIDStr)
	if err != nil {
		return 0, fmt.Errorf("%w: scope party ID is not an integer", errInvalidScope)
	}

	return assumePartyID, nil
}

// tokenExchangePayload is the payload for the token exchange request.
type tokenExchangePayload struct {
	GrantType      grantType `binding:"required" form:"grant_type"`
	ActorToken     string    `binding:"required" form:"actor_token"`
	ActorTokenType tokenType `binding:"required" form:"actor_token_type"`
	Scope          string    `binding:"required" form:"scope"`
}

// Validate checks if the token exchange payload is valid.
func (t tokenExchangePayload) Validate() error {
	v := validate.New()

	v.Check(t.GrantType == grantTypeTokenExchange, "invalid grant type")
	v.Check(t.ActorTokenType == tokenTypeJWT, "invalid actor_token_type")

	return v.Error()
}

func (auth *API) tokenExchangeHandler( //nolint:funlen
	ctx *gin.Context,
	payload tokenExchangePayload,
) {
	err := payload.Validate()
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: err.Error(),
		})

		return
	}

	headerToken := strings.TrimPrefix(ctx.GetHeader("Authorization"), "Bearer ")
	if headerToken != payload.ActorToken {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "actor token must match header token",
		})

		return
	}

	entityToken := new(accessToken)

	err = verifyTokenString(payload.ActorToken, entityToken, jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "Invalid actor token",
		})

		return
	}

	if err := entityToken.Validate(); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "Invalid actor token",
		})

		return
	}

	assumePartyID, err := scopeToPartyID(payload.Scope)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidScope,
			ErrorDescription: "invalid scope format",
		})

		return
	}

	tx, err := auth.db.Begin(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not begin tx in token exchange handler",
			err,
		))

		return
	}
	defer tx.Commit(ctx)

	eid, role, partyScopes, entityID, err := models.AssumeParty(ctx, tx, assumePartyID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidTarget,
			ErrorDescription: "entity cannot assume requested party",
		})

		return
	}

	if partyScopes == nil { // assuming an owned party
		partyScopes = auth.defaultOwnedPartyScopes
	}

	entityScopes := entityToken.Scope
	scopes := scope.ListIntersection(entityScopes, partyScopes)

	partyToken := accessToken{
		ExpirationTime: entityToken.ExpirationTime,
		Role:           role,
		PartyID:        assumePartyID,
		EntityID:       entityID,
		ExternalID:     eid,
		Scope:          scopes,
	}

	slog.InfoContext(
		ctx, "successful token exchange login",
		"entity", entityID, "party", assumePartyID, "eid", eid,
	)

	signedPartyToken, err := partyToken.Sign(jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not sign party token",
			err,
		))

		return
	}

	ctx.JSON(http.StatusOK, tokenResponse{
		AccessToken:     string(signedPartyToken),
		IssuedTokenType: tokenTypeAccess,
		TokenType:       accessTokenTypeBearer,
		ExpiresIn:       partyToken.ExpiresIn(),
	})
}

// jwtBearerPayload is the payload for the JWT bearer request.
type jwtBearerPayload struct {
	GrantType grantType `binding:"required" form:"grant_type"`
	Assertion string    `binding:"required" form:"assertion"`
}

// Validate checks if the JWT bearer payload is valid.
func (j jwtBearerPayload) Validate() error {
	val := validate.New()
	val.Check(j.GrantType == grantTypeJWTBearer, "invalid grant type")
	val.Check(len(strings.Split(j.Assertion, ".")) != 4, "assertion does not look like a jwt") //nolint:mnd

	return val.Error()
}

// jwtBearerHandler handles the jwt-bearer grant type.
//
//nolint:funlen,cyclop
func (auth *API) jwtBearerHandler(
	ctx *gin.Context,
	payload jwtBearerPayload,
) {
	rd, _ := RequestDetailsFromContextKey(ctx, auth.ctxKey)
	if rd.Role() != "flex_anonymous" {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, oauthErrorMessage{
			Error:            oauthErrorInvalidClient,
			ErrorDescription: "client is not anonymous",
		})

		return
	}

	err := payload.Validate()
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: err.Error(),
		})

		return
	}

	// Before being able to verify the token we need to know the entity of the client
	// so that we can fetch their public key to verify the token.
	// This means unpacking the token payload.

	jwtParts := strings.Split(payload.Assertion, ".")
	if len(jwtParts) != 3 { //nolint:mnd
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "assertion is not signed jwt in compact form",
		})

		return
	}

	jwtPayload, err := base64.RawURLEncoding.DecodeString(jwtParts[1])
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "invalid base64 encoding in assertion payload",
		})

		return
	}

	var grant authorizationGrant

	err = json.Unmarshal(jwtPayload, &grant)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "invalid assertion payload format: " + err.Error(),
		})

		return
	}

	if err := grant.Validate(); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "invalid assertion payload: " + err.Error(),
		})

		return
	}

	if grant.Audience != auth.self {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "assertion audience is not " + auth.self,
		})

		return
	}

	// get entity of client
	tx, err := auth.db.Begin(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not begin tx in client credentials handler",
			err),
		)

		return
	}
	defer tx.Commit(ctx)

	entityID, externalID, pubKeyPEM, entityScopes, err := models.GetEntityClientByUUID(
		ctx,
		tx,
		grant.Issuer,
	)
	if err != nil || pubKeyPEM == "" {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidClient,
			ErrorDescription: "invalid or unknown client",
		})

		return
	}

	_ = tx.Commit(ctx)

	block, _ := pem.Decode([]byte(pubKeyPEM))
	pubInterface, err := x509.ParsePKIXPublicKey(block.Bytes)

	pubKey, ok := pubInterface.(*rsa.PublicKey)
	if err != nil || !ok {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"invalid public key stored for client",
			err),
		)

		return
	}

	err = verifyTokenString(payload.Assertion, nil, jws.WithKey(jwa.RS256(), pubKey))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidRequest,
			ErrorDescription: "could not verify assertion: key or payload is invalid: " + err.Error(),
		})

		return
	}

	var token accessToken

	if grant.Subject != nil {
		// entity wants to assume a party
		// we must first "log in" the entity to give it privileges in the database
		// so we can properly run the queries below
		rd := &RequestDetails{
			role:       "flex_entity",
			externalID: externalID,
			// default scopes here because we just use them to get the party ID
			scope: auth.defaultEntityScopes,
		}
		ctx.Set(auth.ctxKey, rd)

		tx, err := auth.db.Begin(ctx)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
				http.StatusInternalServerError,
				"could not begin tx in jwt bearer assumerole",
				err),
			)

			return
		}
		defer tx.Commit(ctx)

		partyID, err := models.GetAssumablePartyIDFromGLN(
			ctx, tx, entityID, grant.Subject.Identifier,
		)
		if err != nil {
			slog.ErrorContext(
				ctx, "getting assumable party ID from GLN failed", "error", err,
			)
			ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidClient,
				ErrorDescription: "could not assume the requested party in sub",
			})

			return
		}

		eid, role, partyScopes, entityID, err := models.AssumeParty(ctx, tx, partyID)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidTarget,
				ErrorDescription: "entity cannot assume requested party",
			})

			return
		}

		scopes := scope.ListIntersection(entityScopes, partyScopes)

		token = accessToken{
			EntityID:       entityID,
			ExpirationTime: newUnixExpirationTime(auth.tokenDurationSeconds),
			ExternalID:     eid,
			PartyID:        partyID,
			Role:           role,
			Scope:          scopes,
		}

		slog.InfoContext(
			ctx, "successful JWT bearer login",
			"entity", entityID, "party", partyID, "eid", externalID,
		)
	} else {
		token = accessToken{
			EntityID:       entityID,
			ExpirationTime: newUnixExpirationTime(auth.tokenDurationSeconds),
			ExternalID:     externalID,
			PartyID:        0,
			Role:           "flex_entity",
			Scope:          entityScopes,
		}

		slog.InfoContext(
			ctx, "successful JWT bearer login",
			"entity", entityID, "party", "null", "eid", externalID,
		)
	}

	signedAccessToken, err := token.Sign(jws.WithKey(jwa.HS256(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not sign access token",
			err),
		)

		return
	}

	ctx.JSON(http.StatusOK, tokenResponse{
		AccessToken:     string(signedAccessToken),
		IssuedTokenType: tokenTypeAccess,
		TokenType:       accessTokenTypeBearer,
		ExpiresIn:       token.ExpiresIn(),
	})
}
