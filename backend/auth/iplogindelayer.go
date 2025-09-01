package auth

import (
	"context"
	"log/slog"
	"math"
	"sync"
	"time"
)

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
	config   LoginDelayerConfig
	delayers map[string]*loginDelayer
	mutex    sync.Mutex
}

// LoginDelayerConfig contains the configuration for the login delayers.
type LoginDelayerConfig struct {
	// time to wait once the maximal number of failed logins has been reached, before the counter is
	// reset and the user can try to login again
	DurationBeforeReset  time.Duration
	MaxFailedLogins      int           // maximum number of failed logins before the IP is blocked
	NbLoginsWithoutDelay int           // number of failures accepted without starting to delay
	BaseDelay            time.Duration // initial blocking time when the delayer starts to delay
	DelayIncreaseFactor  float64       // factor applied for each additional failed login (> 1)
	// maximum waiting time between two login attempts, while the counter is under the maximum
	MaxDelay time.Duration
}

// NewIPLoginDelayer creates a new IPLoginDelayer from various parameters.
func NewIPLoginDelayer(config LoginDelayerConfig) *IPLoginDelayer {
	return &IPLoginDelayer{
		config:   config,
		delayers: make(map[string]*loginDelayer),
		mutex:    sync.Mutex{},
	}
}

// GetDelayerFromIP returns the delayer associated to the given IP address. If
// it is the first time this IP address connects, a new delayer is registered.
//
//nolint:revive
func (ipLoginDelayer *IPLoginDelayer) GetDelayerFromIP(ipAddress string) *loginDelayer {
	ipLoginDelayer.mutex.Lock()
	defer ipLoginDelayer.mutex.Unlock()

	delayer, exists := ipLoginDelayer.delayers[ipAddress]
	if !exists {
		delayer = &loginDelayer{
			ipAddress:            ipAddress,
			config:               &ipLoginDelayer.config,
			mutex:                sync.Mutex{},
			currentFailedLogins:  0,
			lastLoginAttemptTime: time.Now(),
		}
		ipLoginDelayer.delayers[ipAddress] = delayer
	}

	return delayer
}

type loginDelayer struct {
	ipAddress            string
	config               *LoginDelayerConfig
	mutex                sync.Mutex
	currentFailedLogins  int
	lastLoginAttemptTime time.Time
}

// Allow checks if the login attempt is allowed. If it is allowed, it
// defensively increments the number of failed logins.
func (delayer *loginDelayer) Allow(ctx context.Context) bool {
	delayer.mutex.Lock()
	defer delayer.mutex.Unlock()

	delayedTime := delayer.lastLoginAttemptTime.Add(delayer.computeDelay())

	// user tries to connect whereas there is a delay
	if time.Now().Before(delayedTime) {
		slog.DebugContext(
			ctx, "IP is in the waiting period",
			"ipAddress", delayer.ipAddress,
			"until", delayedTime,
			"waitingTime", time.Until(delayedTime),
		)

		return false
	}

	resetTime := delayer.lastLoginAttemptTime.Add(delayer.config.DurationBeforeReset)

	// user waited for a sufficient time, we can reset the failed login counter
	if time.Now().After(resetTime) {
		slog.DebugContext(
			ctx, "Resetting failed logins for IP",
			"ipAddress", delayer.ipAddress,
		)
		delayer.currentFailedLogins = 0
	}

	// user reached the maximum amount of failed logins
	if delayer.currentFailedLogins >= delayer.config.MaxFailedLogins {
		slog.DebugContext(
			ctx, "IP has reached the maximum number of failed logins",
			"ipAddress", delayer.ipAddress,
		)

		return false
	}

	delayer.lastLoginAttemptTime = time.Now()
	delayer.currentFailedLogins++

	slog.DebugContext(
		ctx, "IP failed logins",
		"ipAddress", delayer.ipAddress,
		"failedLogins", delayer.currentFailedLogins,
	)

	return true
}

// MinTimeForNextRequest returns the minimum time at which the next request
// should be sent in order to be accepted.
func (delayer *loginDelayer) MinTimeForNextRequest() time.Time {
	delayer.mutex.Lock()
	defer delayer.mutex.Unlock()

	delayedTime := delayer.lastLoginAttemptTime.Add(delayer.computeDelay())
	resetTime := delayer.lastLoginAttemptTime.Add(delayer.config.DurationBeforeReset)

	if delayer.currentFailedLogins >= delayer.config.MaxFailedLogins {
		return resetTime
	}

	return delayedTime
}

// Cancel should be called when the login attempt was successful, in order to
// decrease the internal counter of failed logins in the login delayer.
func (delayer *loginDelayer) Cancel() {
	delayer.mutex.Lock()
	delayer.currentFailedLogins--
	delayer.mutex.Unlock()
}

// computeDelay computes the delay between two login attempts, while the counter
// is under the maximum.
func (delayer *loginDelayer) computeDelay() time.Duration {
	if delayer.currentFailedLogins < delayer.config.NbLoginsWithoutDelay {
		// the first few logins are not delayed
		return 0
	}

	// min(maxDelay, baseDelay * factor ^ (nbFailed - nbNotDelayed))
	return min(
		delayer.config.MaxDelay,
		time.Duration(
			float64(delayer.config.BaseDelay.Nanoseconds())*
				math.Pow(
					delayer.config.DelayIncreaseFactor,
					float64(
						delayer.currentFailedLogins-delayer.config.NbLoginsWithoutDelay,
					),
				),
		),
	)
}
