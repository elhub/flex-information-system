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
	nbFailedLogins        int
	windowStart           *time.Time
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
	maxFailedLogins    int
	initialWaitingTime time.Duration
	maxWaitingTime     time.Duration
	windowSize         time.Duration
}

// NewIPRateLimiter creates a new IPRateLimiter with a given initial number of
// tokens for each IP, and initial and maximum waiting time when no tokens are
// left.
func NewIPRateLimiter(
	maxFailedLogins int,
	initialWaitingTime time.Duration,
	maxWaitingTime time.Duration,
	windowSize time.Duration,
) *IPRateLimiter {
	return &IPRateLimiter{
		limiters:           make(map[string]*rateLimiter),
		mutex:              &sync.Mutex{},
		maxFailedLogins:    maxFailedLogins,
		initialWaitingTime: initialWaitingTime,
		maxWaitingTime:     maxWaitingTime,
		windowSize:         windowSize,
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

type reservation struct {
	valid         bool
	active        bool
	ipAddress     string
	ipRateLimiter *IPRateLimiter
	limiter       *rateLimiter
}

// ust checks if we have a deadline to wait before retrying. If yes, HTTP 429, otherwise allow. Don't do anything else at this point.
// IsAllowed tries to reserve a token for a given IP address.
func (ipRateLimiter *IPRateLimiter) Reserve(ctx context.Context, ipAddress string) *reservation {
	ipRateLimiter.mutex.Lock()
	defer ipRateLimiter.mutex.Unlock()

	limiter, exists := ipRateLimiter.limiters[ipAddress]
	if !exists {
		limiter = &rateLimiter{
			waitingTime:           ipRateLimiter.initialWaitingTime,
			minTimeForNextRequest: nil,
			nbFailedLogins:        0,
			windowStart:           nil,
		}
		ipRateLimiter.limiters[ipAddress] = limiter
	}

	if limiter.minTimeForNextRequest != nil {
		if limiter.minTimeForNextRequest.After(time.Now()) {
			slog.DebugContext(
				ctx, "IP is in the waiting period",
				"ipAddress", ipAddress,
				"until", limiter.minTimeForNextRequest,
				"waitingTime", limiter.waitingTime,
			)
			return &reservation{
				valid:         false,
				active:        false,
				ipAddress:     ipAddress,
				ipRateLimiter: ipRateLimiter,
				limiter:       limiter,
			}
		}

		slog.DebugContext(
			ctx, "IP was in the waiting period, but can try again",
			"ipAddress", ipAddress,
		)
		limiter.minTimeForNextRequest = nil
	}

	if limiter.windowStart != nil &&
		time.Now().After(limiter.windowStart.Add(ipRateLimiter.windowSize)) {
		limiter.nbFailedLogins = 0
		limiter.windowStart = nil
	}

	return &reservation{
		valid:         true,
		active:        true,
		ipAddress:     ipAddress,
		ipRateLimiter: ipRateLimiter,
		limiter:       limiter,
	}
}

func (reservation *reservation) IsValid() bool {
	return reservation.valid
}

func (reservation *reservation) TimeUntilNext() time.Duration {
	reservation.ipRateLimiter.mutex.Lock()
	defer reservation.ipRateLimiter.mutex.Unlock()

	if reservation.limiter.minTimeForNextRequest == nil {
		return 0
	}
	return time.Until(*reservation.limiter.minTimeForNextRequest)
}

// consume increases the number of failed logins. If we have more than N failed logins, set a delay from now for further requests, based on an internally stored duration that exponentially increases for each reservation that gets consumed over the limit.
func (reservation *reservation) Consume(ctx context.Context) {
	if !reservation.active {
		return
	}

	reservation.ipRateLimiter.mutex.Lock()
	defer reservation.ipRateLimiter.mutex.Unlock()

	now := time.Now()
	reservation.limiter.windowStart = &now
	reservation.limiter.nbFailedLogins++
	if reservation.limiter.nbFailedLogins > reservation.ipRateLimiter.maxFailedLogins {
		slog.DebugContext(
			ctx, "IP reached the maximum number of failed logins",
			"ipAddress", reservation.ipAddress,
		)
		reservation.ipRateLimiter.raiseLimit(ctx, reservation.limiter)
	}
}

func (reservation *reservation) Cancel() {
	reservation.active = false
}
