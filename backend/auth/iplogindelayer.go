package auth

import (
	"context"
	"log/slog"
	"math"
	"sync"
	"time"
)

type loginDelayer struct {
	currentFailedLogins  int
	lastLoginAttemptTime time.Time
}

// IPLoginDelayer is a tool to add delay on failed logins, specialised to IP
// addresses. It makes sure the system does not receive too many failed login
// attempts from the same location. Authorisation is based on tokens.
//
// The delayer starts with a zeroed counter for each IP address. Each time a
// login attempt is made, a reservation should be done on the delayer. By
// default, it increases the counter by one, expecting the login attempt to be
// a failure. If the login attempt is successful, the user should call Cancel
// on the reservation to decrease the counter to its previous value.
//
// The delayer does initially not delay the login attempts, until a certain
// number is reached. Then, the delay is computed exponentially, based on an
// initial delay and a factor applied to it for each additional failed attempt.
//
// If the number of failures reaches a maximum, the IP address is blocked for a
// certain amount of time. Further attempts after the end of this reset duration
// are allowed and the first one resets the counter, allowing failures with
// short delay again. All reservations during the reset duration are denied.
type IPLoginDelayer struct {
	delayers map[string]*loginDelayer
	mutex    *sync.Mutex
	// time to wait once the maximal number of failed logins has been reached, before the counter is
	// reset and the user can try to login again
	durationBeforeReset  time.Duration
	maxFailedLogins      int           // maximum number of failed logins before the IP is blocked
	nbLoginsWithoutDelay int           // number of failures accepted without starting to delay
	baseDelay            time.Duration // initial blocking time when the delayer starts to delay
	delayIncreaseFactor  float64       // factor applied for each additional failed login (> 1)
	// maximum waiting time between two login attempts, while the counter is under the maximum
	maxDelay time.Duration
}

// NewIPLoginDelayer creates a new IPLoginDelayer from various parameters.
func NewIPLoginDelayer(
	durationBeforeReset time.Duration,
	maxFailedLogins int,
	nbLoginsWithoutDelay int,
	baseDelay time.Duration,
	delayIncreaseFactor float64,
	maxDelay time.Duration,
) *IPLoginDelayer {
	return &IPLoginDelayer{
		delayers:             make(map[string]*loginDelayer),
		mutex:                &sync.Mutex{},
		durationBeforeReset:  durationBeforeReset,
		maxFailedLogins:      maxFailedLogins,
		nbLoginsWithoutDelay: nbLoginsWithoutDelay,
		baseDelay:            baseDelay,
		delayIncreaseFactor:  delayIncreaseFactor,
		maxDelay:             maxDelay,
	}
}

// reservation is the value returned when the user tries to login. It is mainly
// used to give the user the time until the next login attempt is allowed, and
// to reverse the internal counter increase in case the attempt was successful.
type reservation struct {
	ipLoginDelayer        *IPLoginDelayer
	delayer               *loginDelayer
	minTimeForNextRequest time.Time
}

// TimeUntilNext returns the time until the next login attempt is allowed.
func (reservation *reservation) TimeUntilNext() time.Duration {
	return time.Until(reservation.minTimeForNextRequest)
}

// Cancel should be called when the login attempt was successful, in order to
// decrease the internal counter of failed logins in the login delayer that
// issued the reservation.
func (reservation *reservation) Cancel() {
	reservation.ipLoginDelayer.mutex.Lock()
	reservation.delayer.currentFailedLogins--
	reservation.ipLoginDelayer.mutex.Unlock()
}

// Reserve tries to register a login attempt from the given IP address in the
// login delayer.
//
//nolint:funlen,revive
func (ipLoginDelayer *IPLoginDelayer) Reserve(
	ctx context.Context, ipAddress string,
) (*reservation, bool) {
	ipLoginDelayer.mutex.Lock()
	defer ipLoginDelayer.mutex.Unlock()

	delayer, exists := ipLoginDelayer.delayers[ipAddress]
	if !exists {
		delayer = &loginDelayer{
			currentFailedLogins:  0,
			lastLoginAttemptTime: time.Now(),
		}
		ipLoginDelayer.delayers[ipAddress] = delayer
	}

	delayedTime := delayer.lastLoginAttemptTime.Add(ipLoginDelayer.computeDelay(delayer))

	// user tries to connect whereas there is a delay
	if time.Now().Before(delayedTime) {
		slog.DebugContext(
			ctx, "IP is in the waiting period",
			"ipAddress", ipAddress,
			"until", delayedTime,
			"waitingTime", time.Until(delayedTime),
		)
		return &reservation{
			ipLoginDelayer:        ipLoginDelayer,
			delayer:               delayer,
			minTimeForNextRequest: delayedTime,
		}, false
	}

	resetTime := delayer.lastLoginAttemptTime.Add(ipLoginDelayer.durationBeforeReset)

	// user waited for a sufficient time, we can reset the failed login counter
	if time.Now().After(resetTime) {
		slog.DebugContext(
			ctx, "Resetting failed logins for IP",
			"ipAddress", ipAddress,
		)
		delayer.currentFailedLogins = 0
	}

	// user reached the maximum amount of failed logins
	if delayer.currentFailedLogins >= ipLoginDelayer.maxFailedLogins {
		slog.DebugContext(
			ctx, "IP has reached the maximum number of failed logins",
			"ipAddress", ipAddress,
		)
		return &reservation{
			ipLoginDelayer:        ipLoginDelayer,
			delayer:               delayer,
			minTimeForNextRequest: resetTime,
		}, false
	}

	delayer.lastLoginAttemptTime = time.Now()
	delayer.currentFailedLogins++

	slog.DebugContext(
		ctx, "IP failed logins",
		"ipAddress", ipAddress,
		"failedLogins", delayer.currentFailedLogins,
	)

	return &reservation{ //nolint:exhaustruct
		ipLoginDelayer: ipLoginDelayer,
		delayer:        delayer,
	}, true
}

// computeDelay computes the delay between two login attempts, while the counter
// is under the maximum.
func (ipLoginDelayer *IPLoginDelayer) computeDelay(delayer *loginDelayer) time.Duration {
	if delayer.currentFailedLogins < ipLoginDelayer.nbLoginsWithoutDelay {
		// the first few logins are not delayed
		return 0
	}

	// min(maxDelay, baseDelay * factor ^ (nbFailed - nbNotDelayed))
	return min(
		ipLoginDelayer.maxDelay,
		time.Duration(
			float64(ipLoginDelayer.baseDelay.Nanoseconds())*
				math.Pow(
					ipLoginDelayer.delayIncreaseFactor,
					float64(
						delayer.currentFailedLogins-ipLoginDelayer.nbLoginsWithoutDelay,
					),
				),
		),
	)
}
