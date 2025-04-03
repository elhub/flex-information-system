package auth

import (
	"context"
	"log/slog"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// IPRateLimiter is a rate limiter specialised to IP addresses. It makes sure
// the system does not receive too many requests from the same location.
//
// Authorisation is based on tokens that get generated at a fixed rate. Each
// incoming request must acquire a token in order to be accepted.
type IPRateLimiter struct {
	limiters    map[string]*rate.Limiter
	mutex       *sync.Mutex
	nbTokens    int
	tokenPeriod time.Duration
}

// NewIPRateLimiter creates a new IPRateLimiter from the initial (and maximum)
// number of tokens and the period to wait before a new token is generated.
func NewIPRateLimiter(
	nbTokens int, tokenPeriod time.Duration,
) *IPRateLimiter {
	return &IPRateLimiter{
		limiters:    make(map[string]*rate.Limiter),
		mutex:       &sync.Mutex{},
		nbTokens:    nbTokens,
		tokenPeriod: tokenPeriod,
	}
}

// IPRateLimiterToken is a token that has been acquired from the rate limiter.
type IPRateLimiterToken struct {
	reservation *rate.Reservation
}

// Release gives this token back to the rate limiter that issued it.
func (ipRateLimiterToken *IPRateLimiterToken) Release() {
	ipRateLimiterToken.reservation.Cancel()
}

// AcquireToken tries to acquire a token for the given IP address.
func (ipRateLimiter *IPRateLimiter) AcquireToken(
	ctx context.Context,
	ipAddress string,
) *IPRateLimiterToken {
	ipRateLimiter.mutex.Lock()
	defer ipRateLimiter.mutex.Unlock()

	limiter, exists := ipRateLimiter.limiters[ipAddress]
	if !exists {
		limiter = rate.NewLimiter(
			rate.Every(ipRateLimiter.tokenPeriod), ipRateLimiter.nbTokens,
		)
		ipRateLimiter.limiters[ipAddress] = limiter
	}

	reservation := limiter.Reserve()
	if reservation.Delay() > 0 { // we must wait for the token = it is not there
		reservation.Cancel() // do not wait for it because we will block the request
		slog.InfoContext(ctx, "Rate limiting request from", "IP", ipAddress)
		return nil
	}
	slog.DebugContext(
		ctx, "Acquiring token for IP",
		"IP", ipAddress,
		"tokens left", limiter.Tokens(),
	)

	return &IPRateLimiterToken{reservation}
}
