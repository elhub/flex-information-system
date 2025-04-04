package auth

import (
	"context"
	"log/slog"
	"sync"
	"time"
)

type rateLimiter struct {
	waitingTime           time.Duration
	minTimeForNextRequest *time.Time
	nbTokens              int
}

// IPRateLimiter is a rate limiter specialised to IP addresses. It makes sure
// the system does not receive too many requests from the same location.
// Authorisation is based on tokens.
//
// The limiter starts with a full bucket of tokens for each IP address. Each
// time a reservation is made, the number of tokens gets decreased. If no token
// is available, the limiter denies authorisation and sets a timestamp for this
// IP to wait until further reservations. All reservations during the waiting
// time are denied.
//
// This limiter does not regenerate tokens. Indeed, it is the responsibility of
// the caller to reset the limiter when they want to restart allowing
// reservations. Waiting time is exponential until a limit set by the user.
// Indeed, when a timestamp is set to make the clients wait, the first
// reservation after this timestamp will be allowed, but doubling the waiting
// time and setting a new timestamp for all subsequent reservations by default,
// hence the need for explicit reset from the user.
type IPRateLimiter struct {
	limiters           map[string]*rateLimiter
	mutex              *sync.Mutex
	maxTokens          int
	initialWaitingTime time.Duration
	maxWaitingTime     time.Duration
}

// NewIPRateLimiter creates a new IPRateLimiter with a given initial number of
// tokens for each IP, and initial and maximum waiting time when no tokens are
// left.
func NewIPRateLimiter(
	maxTokens int,
	initialWaitingTime time.Duration,
	maxWaitingTime time.Duration,
) *IPRateLimiter {
	return &IPRateLimiter{
		limiters:           make(map[string]*rateLimiter),
		mutex:              &sync.Mutex{},
		maxTokens:          maxTokens,
		initialWaitingTime: initialWaitingTime,
		maxWaitingTime:     maxWaitingTime,
	}
}

func (ipRateLimiter *IPRateLimiter) newRateLimiter() *rateLimiter {
	return &rateLimiter{
		waitingTime:           ipRateLimiter.initialWaitingTime,
		minTimeForNextRequest: nil,
		nbTokens:              ipRateLimiter.maxTokens,
	}
}

// raiseLimit doubles the waiting time of a given limiter and sets a timestamp
// for all subsequent reservations to wait.
func (ipRateLimiter *IPRateLimiter) raiseLimit(ctx context.Context, limiter *rateLimiter) {
	previousWaitingTime := limiter.waitingTime
	limiter.waitingTime = min(limiter.waitingTime*2, ipRateLimiter.maxWaitingTime) //nolint:mnd

	slog.DebugContext(
		ctx, "increasing waiting time",
		"from", previousWaitingTime,
		"to", limiter.waitingTime,
	)

	minTime := time.Now().Add(previousWaitingTime)
	limiter.minTimeForNextRequest = &minTime
}

// IsAllowed tries to reserve a token for a given IP address.
func (ipRateLimiter *IPRateLimiter) IsAllowed(ctx context.Context, ipAddress string) bool {
	ipRateLimiter.mutex.Lock()
	defer ipRateLimiter.mutex.Unlock()

	limiter, exists := ipRateLimiter.limiters[ipAddress]
	if !exists {
		limiter = ipRateLimiter.newRateLimiter()
		ipRateLimiter.limiters[ipAddress] = limiter
	}

	if limiter.minTimeForNextRequest != nil {
		if limiter.minTimeForNextRequest.After(time.Now()) {
			// client still in the waiting period
			slog.DebugContext(
				ctx, "IP is in the waiting period",
				"ipAddress", ipAddress,
				"until", limiter.minTimeForNextRequest,
				"waitingTime", limiter.waitingTime,
			)
			return false
		}

		// client was in the waiting period, but can try again
		slog.DebugContext(
			ctx, "IP was in the waiting period, but can try again",
			"ipAddress", ipAddress,
		)
		// here we step up the waiting time, but still let them try
		// if they are successful, the limiter will be completely reset
		// if not, the next request will be in the waiting period
		ipRateLimiter.raiseLimit(ctx, limiter)
		return true
	}

	if limiter.nbTokens == 0 {
		// no token available, step up the waiting time
		slog.DebugContext(
			ctx, "no more tokens",
			"ipAddress", ipAddress,
		)
		ipRateLimiter.raiseLimit(ctx, limiter)
		return false
	}

	// token available, reserve it
	limiter.nbTokens--
	slog.DebugContext(
		ctx, "tokens left",
		"ipAddress", ipAddress,
		"tokens", limiter.nbTokens,
	)
	return true
}

// TimeUntilNextReservation returns the duration until the next reservation can
// be made.
func (ipRateLimiter *IPRateLimiter) TimeUntilNextReservation(ipAddress string) time.Duration {
	ipRateLimiter.mutex.Lock()
	defer ipRateLimiter.mutex.Unlock()

	limiter, exists := ipRateLimiter.limiters[ipAddress]
	if !exists || limiter.minTimeForNextRequest == nil {
		return 0
	}

	return time.Until(*limiter.minTimeForNextRequest)
}

// Reset resets the rate limiter for a given IP address, restoring all the
// tokens and setting back the waiting time to the minimal one.
func (ipRateLimiter *IPRateLimiter) Reset(ctx context.Context, ipAddress string) {
	limiter := ipRateLimiter.newRateLimiter()

	ipRateLimiter.mutex.Lock()
	ipRateLimiter.limiters[ipAddress] = limiter
	ipRateLimiter.mutex.Unlock()

	slog.DebugContext(ctx, "tokens reset", "ipAddress", ipAddress)
}
