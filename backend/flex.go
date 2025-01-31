package flex

import (
	"context"
	"errors"
	"flex/auth"
	"flex/auth/oidc"
	"flex/data"
	"flex/event"
	"flex/pgpool"
	"flex/pgrepl"
	"fmt"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"time"

	"github.com/cenkalti/backoff/v4"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sloggin "github.com/samber/slog-gin"
)

var errMissingEnv = errors.New("environment variable not set")

const requestDetailsContextKey = "_flex/auth"

// Run is the main entry point for the application.
func Run(ctx context.Context, lookupenv func(string) (string, bool)) error { //nolint:funlen,cyclop,gocognit,maintidx
	// Structured logging
	logLevel, exists := lookupenv("FLEX_LOG_LEVEL")
	if !exists {
		log.Println("FLEX_LOG_LEVEL environment variable is not set, using default INFO")
		logLevel = "INFO"
	}

	var slogLevel slog.Level
	err := slogLevel.UnmarshalText([]byte(logLevel))
	if err != nil {
		return fmt.Errorf("could not parse log level: %w", err)
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		// TODO make levels configurable in dev vs test
		Level:       slogLevel,
		AddSource:   slogLevel == slog.LevelDebug,
		ReplaceAttr: nil,
	}))
	slog.SetDefault(logger)

	// TODO we might want to put this in the cmd/flex package
	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	jwtSecret, exists := lookupenv("FLEX_JWT_SECRET")
	if !exists {
		return fmt.Errorf("%w: FLEX_JWT_SECRET", errMissingEnv)
	}

	dbURI, exists := lookupenv("FLEX_DB_URI")
	if !exists {
		return fmt.Errorf("%w: FLEX_DB_URI", errMissingEnv)
	}

	replURI, exists := lookupenv("FLEX_DB_REPLICATION_URI")
	if !exists {
		return fmt.Errorf("%w: FLEX_DB_REPLICATION_URI", errMissingEnv)
	}

	port, exists := lookupenv("FLEX_PORT")
	if !exists {
		log.Println("FLEX_PORT environment variable is not set, using default port 7000")
		port = "7000"
	}

	eventSlotName, exists := lookupenv("FLEX_DB_REPLICATION_SLOT_NAME")
	if !exists {
		return fmt.Errorf("%w: FLEX_DB_REPLICATION_SLOT_NAME", errMissingEnv)
	}

	postgRESTUpstream, exists := lookupenv("FLEX_UPSTREAM_POSTGREST")
	if !exists {
		return fmt.Errorf("%w: FLEX_UPSTREAM_POSTGREST", errMissingEnv)
	}

	authAPIBaseURL, exists := lookupenv("FLEX_AUTH_API_BASE_URL")
	if !exists {
		return fmt.Errorf("%w: FLEX_AUTH_API_BASE_URL", errMissingEnv)
	}

	oidcIssuer, exists := lookupenv("FLEX_OIDC_ISSUER")
	if !exists {
		return fmt.Errorf("%w: FLEX_OIDC_ISSUER", errMissingEnv)
	}

	oidcClientID, exists := lookupenv("FLEX_OIDC_CLIENT_ID")
	if !exists {
		return fmt.Errorf("%w: FLEX_OIDC_CLIENT_ID", errMissingEnv)
	}

	oidcClientSecret, exists := lookupenv("FLEX_OIDC_CLIENT_SECRET")
	if !exists {
		return fmt.Errorf("%w: FLEX_OIDC_CLIENT_SECRET", errMissingEnv)
	}

	oidcRedirectURL, exists := lookupenv("FLEX_OIDC_REDIRECT_URL")
	if !exists {
		return fmt.Errorf("%w: FLEX_OIDC_REDIRECT_URL", errMissingEnv)
	}

	postLogoutRedirectURI, exists := lookupenv("FLEX_OIDC_POST_LOGOUT_REDIRECT_URL")
	if !exists {
		return fmt.Errorf("%w: FLEX_OIDC_POST_LOGOUT_REDIRECT_URL", errMissingEnv)
	}

	// first instantiate the database service implementation
	log.Println("Connecting to the database...")

	ebo := backoff.NewExponentialBackOff()
	ebo.InitialInterval = 1 * time.Second
	ebo.RandomizationFactor = 0.2
	ebo.Multiplier = 2
	ebo.MaxInterval = 10 * time.Minute
	ebo.MaxElapsedTime = 1 * time.Hour

	backoffWithContext := backoff.WithContext(ebo, ctx)

	var dbPool *pgpool.Pool
	err = backoff.Retry(func() error {
		var err error
		log.Println("Trying to connect...")
		dbPool, err = pgpool.New(ctx, dbURI, requestDetailsContextKey)
		if err != nil {
			log.Println("Failed: ", err.Error())
			return fmt.Errorf("could not connect to the database: %w", err)
		}
		return nil
	}, backoffWithContext)
	if err != nil {
		return fmt.Errorf("exhausted db connection retries: %w", err)
	}
	log.Println("Connected!")
	defer dbPool.Close()

	// Using the OIDC issuer as a "feature flag" to enable/disable OIDC stuff
	// TODO remove once in production
	oidcProvider := &oidc.Provider{}
	if oidcIssuer != "" {
		slog.Debug("Creating OIDC provider for issuer " + oidcIssuer)

		oidcProvider, err = oidc.NewProvider(ctx, oidcIssuer, oidcClientID, oidcClientSecret, jwtSecret, oidcRedirectURL, postLogoutRedirectURI)
		if err != nil {
			return fmt.Errorf("could not create OIDC provider: %w", err)
		}
	}

	slog.Debug("Creating auth API")
	authAPI := auth.NewAPI(authAPIBaseURL, dbPool, jwtSecret, oidcProvider, requestDetailsContextKey)

	slog.Debug("Creating data API")
	dataAPI, err := data.NewAPI(postgRESTUpstream, dbPool, requestDetailsContextKey)
	if err != nil {
		return fmt.Errorf("could not create data API module: %w", err)
	}

	// launch the event worker
	go func() {
		// loop in case the replication connection drops
		for {
			log.Println("Launching the event worker...")
			backoffWithContext = backoff.WithContext(ebo, ctx)
			var replConn *pgrepl.Connection
			err = backoff.Retry(func() error {
				var err error
				log.Println("Trying to connect to the replication slot...")
				replConn, err = pgrepl.NewConnection(
					ctx,
					replURI,
					eventSlotName,
					[]string{"flex.event"},
					"event-worker-replication",
				)
				if err != nil {
					log.Printf("Failed: %s", err.Error())
					return fmt.Errorf("failed to create replication listener: %w", err)
				}
				return nil
			}, backoffWithContext)
			if err != nil {
				log.Printf("exhausted db connection retries: %s", err.Error())
				return
			}
			log.Println("Connected to the replication slot!")
			defer replConn.Close(ctx) //nolint:errcheck

			eventWorker, err := event.NewWorker(
				replConn, dbPool, requestDetailsContextKey, "event-worker",
			)
			if err != nil {
				log.Printf("failed to create event worker: %s", err.Error())
			}
			// this ends on error, so we loop and recreate the replication connection
			err = eventWorker.Start(ctx)
			if err != nil {
				log.Printf("failure in event worker: %s", err.Error())

				err = eventWorker.Stop(ctx)
				if err != nil {
					log.Printf("could not stop event worker: %s", err.Error())
				}

				slog.Info("Waiting before retrying the event worker...")
				time.Sleep(15 * time.Second) //nolint:mnd
			}
		}
	}()

	// finally the web server pointing to the handlers defined in the API service

	slog.Info("Launching the web server... ")

	router := gin.New()
	slogginConfig := sloggin.Config{ //nolint:exhaustruct
		WithSpanID:  true,
		WithTraceID: true,
	}
	router.Use(sloggin.NewWithConfig(logger, slogginConfig))

	// TODO use CustomRecovery to return JSON error responses
	router.Use(gin.Recovery())

	// We are handling network-type security elsewhere (nginx, nftables, network policies),
	// so we can trust all proxies here to silence GINs warnings.
	_ = router.SetTrustedProxies(nil)

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{
		"GET", "POST", "PATCH", "DELETE", "OPTIONS",
	}

	corsConfig.AllowHeaders = []string{"Authorization"}

	router.Use(cors.New(corsConfig))
	router.Use(authAPI.TokenDecodingMiddleware())

	// auth API endpoints
	authRouter := router.Group("/auth/v0")
	authRouter.POST("/token", authAPI.PostTokenHandler)
	authRouter.GET("/userinfo", authAPI.GetUserInfoHandler)
	if oidcIssuer != "" {
		authRouter.GET("/session", authAPI.GetSessionHandler)
		authRouter.GET("/login", authAPI.GetLoginHandler)
		authRouter.GET("/callback", authAPI.GetCallbackHandler)
		authRouter.GET("/logout", authAPI.GetLogoutHandler)
	}

	// data API endpoints
	// by default, just act as a reverse proxy for PostgREST
	dataRouter := router.Group("/api/v0")
	dataRouter.Match(
		[]string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		"/*url",
		dataAPI.PostgRESTHandler,
	)

	addr := ":" + port
	log.Println("Running server on server on", addr)
	err = router.Run(addr)
	if err != nil {
		return fmt.Errorf("router failed: %w", err)
	}

	return nil
}
