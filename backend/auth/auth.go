package auth

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"flex/auth/models"
	"flex/auth/oidc"
	"flex/internal/validate"
	"flex/pgpool"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jws"
	"github.com/lestrrat-go/jwx/v3/jwt"
	"github.com/lestrrat-go/jwx/v3/jwt/openid"
)

const (
	sessionPath  = "/auth/v0/session"
	callbackPath = "/auth/v0/callback"
)

// API holds the authentication API handlers.
type API struct {
	// self is the api service itself.
	// Used as the issuer of access tokens and to validate the audience of incoming tokens.
	self                 string
	db                   *pgpool.Pool
	jwtSecret            []byte
	tokenDurationSeconds int
	oidcProvider         *oidc.Provider
	ctxKey               string
}

// NewAPI creates a new auth.API instance.
func NewAPI(self string, db *pgpool.Pool, jwtSecret string, oidcProvider *oidc.Provider, ctxKey string) *API {
	return &API{
		self:      self,
		db:        db,
		jwtSecret: []byte(jwtSecret),
		// algorithm defined once and for all here
		tokenDurationSeconds: 3600,
		oidcProvider:         oidcProvider,
		ctxKey:               ctxKey,
	}
}

// decodeTokenString decodes the token string and returns the claims.
// Returns an error if the token was not verified or validated.
func (auth *API) decodeTokenString(tokenStr string) (*accessToken, error) {
	token := new(accessToken)
	err := verifyTokenString(tokenStr, token, jws.WithKey(jwa.HS384(), auth.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("error in verifying access token: %w", err)
	}

	if err := token.Validate(); err != nil {
		return nil, fmt.Errorf("error in validating access token: %w", err)
	}

	return token, nil
}

// TokenDecodingMiddleware decodes the token and sets it as RequestDetails in the context.
func (auth *API) TokenDecodingMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			// Empty auth header means anonymous user.
			rd := &RequestDetails{role: "flex_anonymous", externalID: ""}
			ctx.Set(auth.ctxKey, rd)
			return
		}

		tokenStr, found := strings.CutPrefix(authHeader, "Bearer ")
		if !found {
			ctx.Header(
				wwwAuthenticateKey,
				wwwAuthenticate{
					Error:            wwwInvalidRequest,
					ErrorDescription: "missing Bearer in Authorization header",
				}.String(),
			)
			ctx.AbortWithStatusJSON(
				http.StatusBadRequest,
				oauthErrorMessage{
					Error:            oauthErrorInvalidRequest,
					ErrorDescription: "missing Bearer in Authorization header",
				},
			)
			return
		}

		token, err := auth.decodeTokenString(tokenStr)
		if err != nil {
			ctx.Header(
				wwwAuthenticateKey,
				wwwAuthenticate{
					Error:            wwwInvalidToken,
					ErrorDescription: "invalid bearer token",
				}.String(),
			)
			ctx.AbortWithStatusJSON(
				http.StatusBadRequest,
				oauthErrorMessage{
					Error:            oauthErrorInvalidRequest,
					ErrorDescription: "unable to verify and validate token",
				},
			)
			return
		}

		rd := &RequestDetails{
			role:       token.Role,
			externalID: token.ExternalID,
		}
		ctx.Set(auth.ctxKey, rd)
	}
}

// tokenPayload is used to inspect the grant type in the token request.
type tokenPayload struct {
	GrantType grantType `binding:"required" form:"grant_type"`
}

// tokenResponse is the response containing the access token.
type tokenResponse struct {
	AccessToken     string          `json:"access_token"`
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
func (auth *API) GetSessionHandler(ctx *gin.Context) {
	accessTokenString, err := ctx.Cookie("flex_session")

	ctx.SetSameSite(http.SameSiteStrictMode)

	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			// Missing cookie just means that there is no session,
			// so returning empty response with 204 No Content makes sense.
			ctx.JSON(http.StatusNoContent, nil)
		} else {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "unknown error when getting cookie", err))
		}
		return
	}

	// TODO actually implement a opaque session cookie that is backed by a (unlogged) database table or something.

	accessToken, err := auth.decodeTokenString(accessTokenString)
	if err != nil {
		// Unset the session cookie
		ctx.SetCookie("flex_session", "not.a.session", -1, sessionPath, "", true, true)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, "invalid session cookie", err))
		return
	}

	ctx.JSON(http.StatusOK, tokenResponse{
		AccessToken:     accessTokenString,
		IssuedTokenType: tokenTypeAccess,
		TokenType:       accessTokenTypeBearer,
		ExpiresIn:       accessToken.ExpiresIn(),
	})
}

type loginCookie struct {
	ReturnURL string `json:"return_url"`
	*oidc.AuthorizationDetails
}

// GetLoginHandler starts the authorization code flow with the external identity provider.
// It pushes and authorization request to the external identity provider before
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
		returnURL,
		authDetails,
	}

	loginCookiePayload, err := json.Marshal(loginCookie)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not marshal login cookie", err))
		return
	}
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
		ctx.AbortWithStatusJSON(http.StatusBadRequest, newErrorMessage(http.StatusBadRequest, fmt.Sprintf("invalid id_token: %v", idToken), err))
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

	pid := oidc.GetIdentifier(token)

	slog.DebugContext(ctx, "callback", "token", idToken, "pid", pid)

	tx, err := auth.db.Begin(ctx)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not begin tx in callback handler", err))
	}
	defer tx.Commit(ctx)

	entityID, eid, _, err := models.GetEntityOfBusinessID(ctx, tx, pid, "pid")
	if err != nil {
		slog.DebugContext(ctx, "getting identity of person identifier failed", "token", idToken, "pid", pid, "error", err)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidClient,
			ErrorDescription: "invalid person identifier",
		})
		return
	}

	accessToken := accessToken{
		EntityID:       entityID,
		ExpirationTime: newUnixExpirationTime(auth.tokenDurationSeconds),
		ExternalID:     eid,
		PartyID:        0,
		Role:           "flex_entity",
	}

	signedAccessToken, err := accessToken.Sign(jws.WithKey(jwa.HS384(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(http.StatusInternalServerError, "could not sign access token", err))
		return
	}

	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie("flex_session", string(signedAccessToken), auth.tokenDurationSeconds, sessionPath, "", true, true)
	ctx.SetCookie("flex_login", "not.a.login", -1, callbackPath, "", true, true)

	ctx.Redirect(http.StatusFound, loginCookie.ReturnURL)
}

// GetLogoutHandler unsets the flex_session cookie.
func (auth *API) GetLogoutHandler(ctx *gin.Context) {
	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie("flex_session", "not.a.session", -1, sessionPath, "", true, true)
	endSessionURL := auth.oidcProvider.EndSessionURL()
	ctx.Redirect(http.StatusFound, endSessionURL)
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
	rd, _ := RequestDetailsFromContext(ctx, auth.ctxKey)
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

	entityID, externalID, pubKeyPEM, err := models.GetEntityOfBusinessID(ctx, tx, grant.Issuer.Identifier, grant.Issuer.IdentifierType)
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

	var partyID int
	if grant.Subject != nil {
		// entity wants to assume a party
		// we must first "log in" the entity to give it privileges in the database
		rd := &RequestDetails{role: "flex_entity", externalID: externalID}
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

		partyID, externalID, err = models.GetPartyMembership(ctx, tx, entityID, grant.Subject.Identifier)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
				Error:            oauthErrorInvalidClient,
				ErrorDescription: "could not assume the requested party in sub",
			})
			return
		}
	}

	accessToken := accessToken{
		EntityID:       entityID,
		ExpirationTime: newUnixExpirationTime(auth.tokenDurationSeconds),
		ExternalID:     externalID,
		PartyID:        partyID,
		Role:           "flex_entity",
	}

	signedAccessToken, err := accessToken.Sign(jws.WithKey(jwa.HS384(), auth.jwtSecret))
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
		ExpiresIn:       accessToken.ExpiresIn(),
	})
}

// clientCredentialsPayload is the payload for the client credentials request.
type clientCredentialsPayload struct {
	GrantType    grantType `binding:"required" form:"grant_type"`
	ClientID     string    `binding:"required" form:"client_id"`
	ClientSecret string    `binding:"required" form:"client_secret"`
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

	entityID, eid, err := models.GetEntityOfCredentials(
		ctx, tx, payload.ClientID, payload.ClientSecret,
	)
	if err != nil {
		slog.InfoContext(ctx, "getting identity of credentials failed: ", "error", err)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidClient,
			ErrorDescription: "Invalid client_id or client_secret",
		})
		return
	}

	accessToken := accessToken{
		EntityID:       entityID,
		ExpirationTime: newUnixExpirationTime(auth.tokenDurationSeconds),
		ExternalID:     eid,
		PartyID:        0,
		Role:           "flex_entity",
	}

	signedAccessToken, err := accessToken.Sign(jws.WithKey(jwa.HS384(), auth.jwtSecret))
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, newErrorMessage(
			http.StatusInternalServerError,
			"could not sign access token",
			err),
		)
		return
	}

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
	err = verifyTokenString(payload.ActorToken, entityToken, jws.WithKey(jwa.HS384(), auth.jwtSecret))
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

	eid, role, entityID, err := models.AssumeParty(ctx, tx, assumePartyID)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, oauthErrorMessage{
			Error:            oauthErrorInvalidTarget,
			ErrorDescription: "entity cannot assume requested party",
		})
		return
	}

	partyToken := accessToken{
		ExpirationTime: entityToken.ExpirationTime,
		Role:           role,
		PartyID:        assumePartyID,
		EntityID:       entityID,
		ExternalID:     eid,
	}

	signedPartyToken, err := partyToken.Sign(jws.WithKey(jwa.HS384(), auth.jwtSecret))
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
	rd, _ := RequestDetailsFromContext(ctx, auth.ctxKey)
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
