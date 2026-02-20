package oidc

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v3/jwa"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"golang.org/x/oauth2"
)

// openidConfiguration is a struct used to unmarshal the OIDC details from the discovery endpoint.
type openidConfiguration struct {
	Issuer                string `json:"issuer"`
	PAREndpoint           string `json:"pushed_authorization_request_endpoint"`
	AuthorizationEndpoint string `json:"authorization_endpoint"`
	EndSessionEndpoint    string `json:"end_session_endpoint"`
	JWKSURI               string `json:"jwks_uri"`
	TokenEndpoint         string `json:"token_endpoint"`
}

// AuthorizationDetails is a struct containing
// state, nonce and code verifier from a pushed authorization request.
type AuthorizationDetails struct {
	StateVerifier string `json:"state"`
	NonceVerifier string `json:"nonce"`
	CodeVerifier  string `json:"code_verifier"`
}

// Provider is a complete OIDC provider configuration.
// It is discovered via the OIDC discovery endpoint.
// For production this is https://idporten.no/.well-known/openid-configuration
type Provider struct {
	// hashKey is the key used in HMAC hashing of the state and nonce.
	hashKey []byte
	// issuer is the OIDC issuer URL.
	issuer string
	// parendpoint is the OIDC pushed authorization request endpoint.
	parEndpoint string
	// authorizationEndpoint is the OIDC authorization endpoint.
	authorizationEndpoint string
	// endSessionEndpoint is the OIDC end session endpoint.
	endSessionEndpoint string
	// postLogoutRedirectURI is the url where the user is redirected after logout from the OIDC provider.
	postLogoutRedirectURI string
	// tokenEndpoint is the OIDC token endpoint.
	tokenEndpoint string
	// jwksURI is the OIDC JWKS URI.
	jwksURI string
	// jwksCache
	jwksCache *jwk.Cache
	// oauth2Config is the oauth2 configuration for the OIDC provider.
	oauth2Config oauth2.Config
}

// oidcTimeoutSeconds is the timeout for requests to the OIDC provider.
const oidcTimeoutSeconds = 10

// NewProvider creates a new OIDC provider.
func NewProvider( //nolint: funlen
	ctx context.Context,
	issuerURL, clientID, clientSecret, hashKey, redirectURL, postLogoutRedirectURI string,
) (*Provider, error) {
	issuerURL = strings.TrimSuffix(issuerURL, "/")
	wellKnown := issuerURL + "/.well-known/openid-configuration"

	slog.DebugContext(ctx, "Fetching OIDC provider details from "+wellKnown)

	configCtx, cancel := context.WithTimeout(ctx, oidcTimeoutSeconds*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(configCtx, http.MethodGet, wellKnown, nil)
	if err != nil {
		return nil, fmt.Errorf("could not create OIDC provider request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req) //nolint:gosec // URL is from configured issuer URL, not user input
	if err != nil {
		return nil, fmt.Errorf("could not fetch OIDC provider details: %w", err)
	}
	defer resp.Body.Close()

	slog.DebugContext(ctx, "OIDC provider details fetched")

	oc := new(openidConfiguration)

	err = json.NewDecoder(resp.Body).Decode(oc)
	if err != nil {
		return nil, fmt.Errorf("could not decode OIDC provider details: %w", err)
	}

	slog.DebugContext(ctx, "Creating JWK cache")

	jwksCache, err := jwk.NewCache(ctx, httprc.NewClient())
	if err != nil {
		return nil, fmt.Errorf("could not create JWK cache: %w", err)
	}

	slog.DebugContext(ctx, "Registering URI in JWK cache: "+oc.JWKSURI)

	cacheRegisterCtx, cancel := context.WithTimeout(ctx, oidcTimeoutSeconds*time.Second)
	defer cancel()

	err = jwksCache.Register(cacheRegisterCtx, oc.JWKSURI)
	if err != nil {
		return nil, fmt.Errorf("could not register JWK URI in cache: %w", err)
	}

	slog.DebugContext(ctx, "Cache ready")

	return &Provider{
		hashKey:               []byte(hashKey),
		issuer:                oc.Issuer,
		parEndpoint:           oc.PAREndpoint,
		authorizationEndpoint: oc.AuthorizationEndpoint,
		endSessionEndpoint:    oc.EndSessionEndpoint,
		postLogoutRedirectURI: postLogoutRedirectURI,
		tokenEndpoint:         oc.TokenEndpoint,
		jwksURI:               oc.JWKSURI,
		jwksCache:             jwksCache,
		oauth2Config: oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			Scopes:       []string{"openid", "profile"},
			Endpoint: oauth2.Endpoint{ //nolint: exhaustruct
				AuthURL:   oc.AuthorizationEndpoint,
				TokenURL:  oc.TokenEndpoint,
				AuthStyle: oauth2.AuthStyleInHeader,
			},
			RedirectURL: redirectURL,
		},
	}, nil
}

// AuthURL pushes a authorization request.
// If a PAR endpoint is not available, the regular authorization endpoint is used.
// Returns the URL, generated nonce and state.
func (p *Provider) AuthURL(ctx context.Context) (string, *AuthorizationDetails, error) {
	ad := new(AuthorizationDetails)
	ad.CodeVerifier = oauth2.GenerateVerifier()
	codeChallenge := oauth2.S256ChallengeFromVerifier(ad.CodeVerifier)

	stateVerifier, err := newRandomVerifier(p.hashKey)
	if err != nil {
		return "", ad, fmt.Errorf("could not create random string for state: %w", err)
	}

	ad.StateVerifier = stateVerifier.msgStr()
	state := stateVerifier.hashStr()

	nonceVerifier, err := newRandomVerifier(p.hashKey)
	if err != nil {
		return "", ad, fmt.Errorf("could not create random string for nonce: %w", err)
	}

	ad.NonceVerifier = nonceVerifier.msgStr()
	nonce := nonceVerifier.hashStr()

	var authURL string

	if p.parEndpoint != "" {
		authURL, err = p.parRequest(ctx, state, nonce, codeChallenge)
	}

	if p.parEndpoint == "" || err != nil {
		// Fall back to regular front-channel
		authURL = p.oauth2Config.AuthCodeURL(
			state,
			oauth2.S256ChallengeOption(ad.CodeVerifier),
			oauth2.SetAuthURLParam("nonce", nonce),
			oauth2.SetAuthURLParam("state", state),
			oauth2.SetAuthURLParam("acr_values", "idporten-loa-substantial"),
		)
	}

	return authURL, ad, nil
}

// EndSessionURL returns the end session URL with query parameters.
func (p *Provider) EndSessionURL() string {
	params := url.Values{}

	if p.endSessionEndpoint == "" {
		// fallback for authelia
		params.Add("rd", p.postLogoutRedirectURI)
		return p.issuer + "/logout?" + params.Encode()
	}
	// TODO add params. This requires the id_token_hint which we currently don't store for the session.
	// So currently we just rely on the default sign out.
	// params.Add("post_logout_redirect_uri", p.postLogoutRedirectURI)
	// params.Add("id_token_hint", TODOgetidtoken)
	return p.endSessionEndpoint // + "?" + params.Encode()
}

// Issuer returns the issuer URL.
func (p *Provider) Issuer() string {
	return p.issuer
}

// ClientID returns the client ID.
func (p *Provider) ClientID() string {
	return p.oauth2Config.ClientID
}

// Exchange exchanges a code for a token.
// Wraps (oauth2.Config).Exchange.
func (p *Provider) Exchange(ctx context.Context, code string, verifier string) (*oauth2.Token, error) {
	// TODO verify issuer of the token.
	token, err := p.oauth2Config.Exchange(ctx, code, oauth2.VerifierOption(verifier))
	if err != nil {
		return nil, fmt.Errorf("could not exchange code for token: %w", err)
	}

	return token, nil
}

// GetKeySet returns the JWK key set from cache.
//
//nolint:ireturn
func (p *Provider) GetKeySet(ctx context.Context) (jwk.Set, error) {
	set, err := p.jwksCache.Lookup(ctx, p.jwksURI)
	if err != nil {
		return nil, fmt.Errorf("could not lookup JWKS: %w", err)
	}

	// The lib we use for JWT verification requires that alg is set and matches
	// the alg in the token. Some id providers do not set the alg. In those cases
	// we set it to RS256 if the keytype is RSA.
	// We assume and support only RS256 since it is what we see in the id providers
	// at time of writing.
	//
	// See: https://github.com/lestrrat-go/jwx/issues/395#issuecomment-861061925
	for i := range set.Len() {
		key, _ := set.Key(i)
		if _, ok := key.Algorithm(); !ok {
			if key.KeyType() == jwa.RSA() {
				key.Set(jwk.AlgorithmKey, jwa.RS256()) //nolint:errcheck
			}
		}
	}

	return set, nil
}

// Verify verifies a nonce or state.
// It errors if it cannot decode the msgStr.
func (p *Provider) Verify(msgStr, hashStr string) (bool, error) {
	v, err := newStrVerifier(p.hashKey, msgStr)
	if err != nil {
		return false, fmt.Errorf("could not create verifier: %w", err)
	}

	return v.verifyStr(hashStr), nil
}

// parResponse is a struct used to unmarshal the response from the PAR endpoint.
type parResponse struct {
	ExpiresIn  int    `json:"expires_in"`
	RequestURI string `json:"request_uri"`
}

// addBasicAuth adds basic auth to the request using client id and secret.
func (p *Provider) addBasicAuth(r *http.Request) {
	auth := p.oauth2Config.ClientID + ":" + p.oauth2Config.ClientSecret
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(auth))
	r.Header.Add("Authorization", "Basic "+encodedAuth)
}

// parAuthURL returns the authorization URL.
func (p *Provider) parAuthURL(requestURI string) string {
	var buf bytes.Buffer
	buf.WriteString(p.oauth2Config.Endpoint.AuthURL)

	if strings.Contains(p.oauth2Config.Endpoint.AuthURL, "?") {
		buf.WriteByte('&')
	} else {
		buf.WriteByte('?')
	}

	v := url.Values{
		"request_uri": {requestURI},
		"client_id":   {p.oauth2Config.ClientID},
	}

	buf.WriteString(v.Encode())

	return buf.String()
}

// parRequest returns the request body for the PAR endpoint.
func (p *Provider) parRequest(ctx context.Context, state, nonce, codeChallenge string) (string, error) {
	par := new(parResponse)
	// Prod
	// https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_par.html
	// Test
	// https://www.authelia.com/integration/openid-connect/introduction/#pushed-authorization-requests-endpoint
	data := url.Values{
		"response_type": []string{"code"},
		"client_id":     []string{p.oauth2Config.ClientID},
		"redirect_uri":  []string{p.oauth2Config.RedirectURL},
		"scope":         []string{strings.Join(p.oauth2Config.Scopes, " ")},
		"state":         []string{state},
		"nonce":         []string{nonce},
		"acr_values":    []string{"idporten-loa-substantial"},
		// TODO prompt is not formally supported by authelia
		// https://github.com/authelia/authelia/issues/2596
		// "prompt":                []string{"login"},
		"code_challenge":        []string{codeChallenge},
		"code_challenge_method": []string{"S256"},
	}

	parCtx, cancel := context.WithTimeout(ctx, oidcTimeoutSeconds*time.Second)
	defer cancel()

	client := new(http.Client)
	req, _ := http.NewRequestWithContext(
		parCtx, http.MethodPost, p.parEndpoint, strings.NewReader(data.Encode()),
	)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	p.addBasicAuth(req)

	resp, err := client.Do(req) //nolint:gosec // URL is from OIDC provider configuration, not user input
	if err != nil {
		return "", fmt.Errorf("could not push authorization request: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return "", IncorrectPARResponseError{status: resp.Status}
	}
	defer resp.Body.Close()

	err = json.NewDecoder(resp.Body).Decode(par)
	if err != nil {
		return "", fmt.Errorf("could not decode PAR response: %w", err)
	}

	return p.parAuthURL(par.RequestURI), nil
}

// IncorrectPARResponseError is an error returned when the PAR response is incorrect.
type IncorrectPARResponseError struct {
	status string
}

// Error returns the error message.
func (e IncorrectPARResponseError) Error() string {
	return "incorrect PAR response code: " + e.status
}
