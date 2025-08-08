package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

// errorMessage is the standard message for errors in the API.
// It is modelled after the postgREST error message.
type errorMessage struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"details,omitempty"`
	Hint    string `json:"hint,omitempty"`
}

// newErrorMessage creates a new errorMessage.
//
// The http status code ends up as `HTTP<code>` in the Code field and
// the message is the text representation of the status code.
//
// The detail is a string that can be used to provide more information and ends up in the Detail field.
//
// The string representation of err ends up in the Hint field.
func newErrorMessage(httpStatusCode int, detail string, err error) errorMessage {
	hint := ""
	if err != nil {
		hint = err.Error()
	}

	return errorMessage{
		Code:    "HTTP" + strconv.Itoa(httpStatusCode),
		Message: http.StatusText(httpStatusCode),
		Detail:  detail,
		Hint:    hint,
	}
}

// oauthErrorMessage is a struct that represents the OAuth 2.0 error response.
// https://datatracker.ietf.org/doc/html/rfc6749
type oauthErrorMessage struct {
	Error            oauthError `json:"error"`
	ErrorDescription string     `json:"error_description,omitempty"`
	// These two field are part of the response standard but are not used in this project.
	// Leaving them out to avoid nagging from exhaustruct
	// ErrorURI         string     `json:"error_uri,omitempty"`
	// State            string     `json:"state,omitempty"`
}

// oauthError is a type that represents the OAuth 2.0 error codes.
type oauthError string

//nolint:unused
const (
	// oauthErrorAccessDenied is the access_denied error code.
	oauthErrorAccessDenied oauthError = "access_denied"
	// oauthErrorInvalidClient is the invalid_client error code.
	oauthErrorInvalidClient oauthError = "invalid_client"
	// oauthErrorInvalidGrant is the invalid_grant error code.
	oauthErrorInvalidGrant oauthError = "invalid_grant"
	// oauthErrorInvalidRequest is the invalid_request error code.
	oauthErrorInvalidRequest oauthError = "invalid_request"
	// oauthErrorInvalidScope is the invalid_scope error code.
	oauthErrorInvalidScope oauthError = "invalid_scope"
	// oauthErrorInvalidTarget is the invalid_target error code.
	oauthErrorInvalidTarget oauthError = "invalid_target"
	// oauthErrorServerError is the server_error error code.
	oauthErrorServerError oauthError = "server_error"
	// oauthErrorTemporarilyUnavailable is the temporarily_unavailable error code.
	oauthErrorTemporarilyUnavailable oauthError = "temporarily_unavailable"
	// oauthErrorUnauthorizedClient is the unauthorized_client error code.
	oauthErrorUnauthorizedClient oauthError = "unauthorized_client"
	// oauthErrorUnsupportedGrantType is the unsupported_grant_type error code.
	oauthErrorUnsupportedGrantType oauthError = "unsupported_grant_type"
	// oauthErrorUnsupportedResponseType is the unsupported_response_type error code.
	oauthErrorUnsupportedResponseType oauthError = "unsupported_response_type"
)

// grantType is a type that represents the grant types.
type grantType string

//nolint:gosec
const (
	// grantTypeClientCredentials is the client_credentials grant type.
	grantTypeClientCredentials grantType = "client_credentials"
	// grantTypeTokenExchange is the token_exchange grant type.
	grantTypeTokenExchange grantType = "urn:ietf:params:oauth:grant-type:token-exchange"
	// grantTypeJWTBearer is the jwt_bearer grant type.
	grantTypeJWTBearer grantType = "urn:ietf:params:oauth:grant-type:jwt-bearer"
)

// tokenType is a type that represents the token types.
type tokenType string

//nolint:gosec,unused
const (
	// tokenTypeJWT is the Bearer token type.
	tokenTypeJWT tokenType = "urn:ietf:params:oauth:token-type:jwt"
	// tokenTypeAccess is the Access Token token type.
	tokenTypeAccess tokenType = "urn:ietf:params:oauth:token-type:access_token"
	// tokenTypeRefresh is the Refresh Token token type.
	tokenTypeRefresh tokenType = "urn:ietf:params:oauth:token-type:refresh_token"
	// tokenTypeID is the ID Token token type.
	tokenTypeID tokenType = "urn:ietf:params:oauth:token-type:id_token"
)

// accessTokenType is a type that represents the access token types.
// as specified by https://www.rfc-editor.org/rfc/rfc6749#section-7.1
// Specifies the method of using the access token issued.
type accessTokenType string

const (
	// accessTokenTypeBearer is the Bearer access token type.
	accessTokenTypeBearer accessTokenType = "Bearer"
)

// wwwAuthenticateKey is the key for the www-Authenticate header.
const wwwAuthenticateKey string = "WWW-Authenticate"

// wwwAuthenticateErrorCode is a type that represents the error codes for the www-Authenticate header.
type wwwAuthenticateErrorCode string

//nolint:unused
const (
	// wwwInvalidRequest is the error code for an invalid request.
	wwwInvalidRequest wwwAuthenticateErrorCode = "invalid_request"
	// wwwInvalidToken is the error code for an invalid token.
	wwwInvalidToken wwwAuthenticateErrorCode = "invalid_token"
	// wwwInsufficientScope is the error code for insufficient scope.
	wwwInsufficientScope wwwAuthenticateErrorCode = "insufficient_scope"
)

// wwwAuthenticate is a type that represents the www-Authenticate header value.
// Based on https://www.rfc-editor.org/rfc/rfc2617 and https://www.rfc-editor.org/rfc/rfc6750
type wwwAuthenticate struct {
	Error            wwwAuthenticateErrorCode
	ErrorDescription string
}

// String returns the www-Authenticate header value as a string.
func (w wwwAuthenticate) String() string {
	if w.Error == "" {
		return "Bearer"
	}

	return fmt.Sprintf(`Bearer error="%s", error_description="%s"`, w.Error, w.ErrorDescription)
}

// unixTime is a time.Time that marshals to and from a Unix timestamp.
type unixTime struct {
	time.Time
}

// MarshalJSON implements the json.Marshaler interface.
func (ut unixTime) MarshalJSON() ([]byte, error) {
	return []byte(strconv.FormatInt(ut.Unix(), 10)), nil
}

// UnmarshalJSON implements the json.Unmarshaler interface.
func (ut *unixTime) UnmarshalJSON(data []byte) error {
	var utInt int64

	err := json.Unmarshal(data, &utInt)
	if err != nil {
		return fmt.Errorf("could not unmarshal unix time: %w", err)
	}

	ut.Time = time.Unix(utInt, 0)

	return nil
}
