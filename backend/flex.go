package flex

import (
	"context"
	"errors"
	"flex/auth"
	"flex/auth/oidc"
	"flex/data"
	"flex/event"
	"flex/internal/middleware"
	"flex/internal/openapi"
	"flex/internal/trace"
	"flex/pgpool"
	"flex/pgrepl"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/cenkalti/backoff/v4"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/graceful"
	"github.com/gin-gonic/gin"

	sloggin "github.com/samber/slog-gin"
)

var errMissingEnv = errors.New("environment variable not set")

const requestDetailsContextKey = "_flex/auth"

// WrapHandlerFunc is a helper function for wrapping http.HandlerFunc and returns a Gin handler.
// Is is basically gin.WrapF but explicitly passing the full gin.Context.
// This is necessary because we are using gin.Contexts in our middleware.
// The intended use of this function is to allow us to move away fron gin-gonic/gin,
// by (slowly?) rewriting our handlers to use the standard http.HandlerFunc signature.
func WrapHandlerFunc(f http.HandlerFunc) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		f(ctx.Writer, ctx.Request.WithContext(ctx))
	}
}

// WrapHandler is a helper function for wrapping http.Handler and returns a Gin handler.
// Is is basically gin.WrapH but explicitly passing the full gin.Context.
// This is necessary because we are using gin.Contexts in our middleware.
// The intended use of this function is to allow us to move away fron gin-gonic/gin,
// by (slowly?) rewriting our handlers to use the standard http.HandlerFunc signature.
func WrapHandler(f http.Handler) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		f.ServeHTTP(ctx.Writer, ctx.Request.WithContext(ctx))
	}
}

// WrapMiddleware takes a standard library function-based middleware and turns
// it into a Gin middleware.
func WrapMiddleware(mid func(http.Handler) http.Handler) gin.HandlerFunc {
	// The Gin engine finds the list of handlers corresponding to the request and
	// calls ctx.Next to execute them all in a loop.
	// cf https://github.com/gin-gonic/gin/blob/75ccf94d605a05fe24817fc2f166f6f2959d5cea/gin.go#L630-L636

	// By default, this loop runs automatically until the last handler is called,
	// unless we stop the loop manually by calling ctx.Abort.
	// cf https://github.com/gin-gonic/gin/blob/75ccf94d605a05fe24817fc2f166f6f2959d5cea/context.go#L182-L188

	// We need to turn this logic of iteration into a logic of wrapping,
	// where the remaining handlers are represented as a function passed to the
	// outermost (earliest running) middleware, that can choose to call them or
	// discard them. In iteration-based design, continuing the loop is the default
	// and we need to be explicit if we want to stop it (ctx.Abort), whereas in
	// wrapping-based design, stopping the loop is the default and we need to be
	// explicit if we want to continue it (call the next handler).

	// We do this by checking if the response has been written, which means either
	// the middleware errored or the next handler was called.

	return func(ctx *gin.Context) {
		// If the middleware sets things in the request context, then the request
		// value changes, which must be reflected in the Gin context.
		next := http.HandlerFunc(func(_ http.ResponseWriter, req *http.Request) {
			ctx.Request = req
			ctx.Next()
		})

		mid(next).ServeHTTP(ctx.Writer, ctx.Request)

		if ctx.Writer.Written() {
			ctx.Abort()
		}
	}
}

// Run is the main entry point for the application.
func Run(ctx context.Context, lookupenv func(string) (string, bool)) error { //nolint:funlen,cyclop,gocognit,maintidx,gocyclo
	// Sets the global TracerProvider.
	trace.Init()

	// Structured logging
	logLevel, exists := lookupenv("FLEX_LOG_LEVEL")
	if !exists {
		logLevel = "INFO"
	}

	tracer := trace.Tracer("flex")
	ctx, span := tracer.Start(ctx, "flex")
	defer span.End()

	var slogLevel slog.Level
	err := slogLevel.UnmarshalText([]byte(logLevel))
	if err != nil {
		return fmt.Errorf("could not parse log level: %w", err)
	}

	logger := slog.New(trace.SlogHandler{Handler: slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		// TODO make levels configurable in dev vs test
		Level:       slogLevel,
		AddSource:   slogLevel == slog.LevelDebug,
		ReplaceAttr: nil,
	})})
	slog.SetDefault(logger)

	// we report missing env variable after logger has been established
	if !exists {
		slog.InfoContext(ctx, "FLEX_LOG_LEVEL environment variable is not set, using default INFO")
	}

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
		slog.InfoContext(ctx, "FLEX_PORT environment variable is not set, using default port 7001")
		port = "7001"
	}

	eventSlotName, exists := lookupenv("FLEX_DB_REPLICATION_SLOT_NAME")
	if !exists {
		return fmt.Errorf("%w: FLEX_DB_REPLICATION_SLOT_NAME", errMissingEnv)
	}

	postgRESTUpstream, exists := lookupenv("FLEX_UPSTREAM_POSTGREST")
	if !exists {
		return fmt.Errorf("%w: FLEX_UPSTREAM_POSTGREST", errMissingEnv)
	}

	baseURL, exists := lookupenv("FLEX_BASE_URL")
	if !exists {
		return fmt.Errorf("%w: FLEX_BASE_URL", errMissingEnv)
	}
	authAPIBaseURL := baseURL + "auth/v0/"
	dataAPIBaseURL := baseURL + "api/v0/"

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

	isLoginLimitingDisabled := false
	_, exists = lookupenv("FLEX_DISABLE_LOGIN_LIMITING")
	if exists {
		isLoginLimitingDisabled = true
		slog.InfoContext(ctx, "Disabled login limiting")
	} else {
		slog.InfoContext(ctx, "Default login limiting")
	}

	// first instantiate the database service implementation
	slog.InfoContext(ctx, "Connecting to the database...")

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
		slog.InfoContext(ctx, "Trying to connect...")
		dbPool, err = pgpool.New(ctx, dbURI, requestDetailsContextKey)
		if err != nil {
			slog.InfoContext(ctx, "Failed: ", "error", err.Error())
			return fmt.Errorf("could not connect to the database: %w", err)
		}
		return nil
	}, backoffWithContext)
	if err != nil {
		return fmt.Errorf("exhausted db connection retries: %w", err)
	}
	slog.InfoContext(ctx, "Connected!")
	defer dbPool.Close()

	// Using the OIDC issuer as a "feature flag" to enable/disable OIDC stuff
	// TODO remove once in production
	oidcProvider := &oidc.Provider{}
	if oidcIssuer != "" {
		slog.DebugContext(ctx, "Creating OIDC provider for issuer "+oidcIssuer)

		oidcProvider, err = oidc.NewProvider(ctx, oidcIssuer, oidcClientID, oidcClientSecret, jwtSecret, oidcRedirectURL, postLogoutRedirectURI)
		if err != nil {
			return fmt.Errorf("could not create OIDC provider: %w", err)
		}
	}

	slog.DebugContext(ctx, "Creating auth API")
	authAPI := auth.NewAPI(
		authAPIBaseURL,
		dbPool,
		jwtSecret,
		oidcProvider,
		requestDetailsContextKey,
		isLoginLimitingDisabled,
	)

	slog.DebugContext(ctx, "Creating data API")
	dataAPIHandler, err := data.NewAPIHandler(
		dataAPIBaseURL, postgRESTUpstream, dbPool, requestDetailsContextKey,
	)
	if err != nil {
		return fmt.Errorf("could not create data API module: %w", err)
	}

	// launch the event worker
	go func() {
		// loop in case the replication connection drops
		for {
			select {
			case <-ctx.Done():
				slog.InfoContext(ctx, "context canceled, stopping event worker")
				return
			default:
				slog.InfoContext(ctx, "Launching the event worker...")
				backoffWithContext = backoff.WithContext(ebo, ctx)
				var replConn *pgrepl.Connection
				err = backoff.Retry(func() error {
					var err error
					slog.InfoContext(ctx, "Trying to connect to the replication slot...")
					replConn, err = pgrepl.NewConnection(
						ctx,
						replURI,
						eventSlotName,
						[]string{"flex.event"},
						"event-worker-replication",
					)
					if err != nil {
						slog.InfoContext(ctx, "Failed", "error", err.Error())
						return fmt.Errorf("failed to create replication listener: %w", err)
					}
					return nil
				}, backoffWithContext)
				if err != nil {
					slog.InfoContext(ctx, "exhausted db connection retries", "error", err.Error())
					return
				}
				slog.InfoContext(ctx, "Connected to the replication slot!")
				defer replConn.Close(ctx) //nolint:errcheck

				eventWorker, err := event.NewWorker(
					replConn, dbPool, requestDetailsContextKey, "event-worker",
				)
				if err != nil {
					slog.InfoContext(ctx, "failed to create event worker", "error", err.Error())
				}
				// this ends on error, so we loop and recreate the replication connection
				err = eventWorker.Start(ctx)
				if err != nil {
					slog.InfoContext(ctx, "failure in event worker", "error", err.Error())

					err = eventWorker.Stop(ctx)
					if err != nil {
						slog.InfoContext(ctx, "could not stop event worker", "error", err.Error())
					}

					slog.InfoContext(ctx, "Waiting before retrying the event worker...")
					time.Sleep(15 * time.Second) //nolint:mnd
				}
			}
		}
	}()

	// finally the web server pointing to the handlers defined in the API service

	slog.InfoContext(ctx, "Launching the web server... ")
	addr := ":" + port

	router, err := graceful.Default(graceful.WithAddr(addr))
	if err != nil {
		return fmt.Errorf("could not create router: %w", err)
	}

	// Enabling the fallback context ensures that gin falls back to the underlying context.Context.
	// It must be set e.g. for otel tracing to work.
	router.ContextWithFallback = true
	router.Use(trace.Middleware()) //nolint:contextcheck

	slogginConfig := sloggin.Config{ //nolint:exhaustruct
		// We are providing our own trace.SlogHandler, so we don't need to log trace IDs here.
		WithSpanID:        false,
		WithTraceID:       false,
		WithRequestBody:   slogLevel == slog.LevelDebug,
		WithResponseBody:  slogLevel == slog.LevelDebug,
		WithRequestHeader: slogLevel == slog.LevelDebug,
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
	router.Use(WrapMiddleware(middleware.RealIP))
	router.Use(WrapMiddleware(authAPI.TokenDecodingMiddleware))

	// auth API endpoints
	authRouter := router.Group("/auth/v0")
	authRouter.GET("/", WrapHandlerFunc(openapi.ElementsHandlerFunc("Auth API")))                              //nolint:contextcheck
	authRouter.GET("/openapi.json", WrapHandlerFunc(auth.OpenAPIHandlerFunc(authAPIBaseURL, "Flex Auth API"))) //nolint:contextcheck
	authRouter.POST("/token", authAPI.PostTokenHandler)
	authRouter.GET("/userinfo", authAPI.GetUserInfoHandler)
	authRouter.GET("/session", WrapHandlerFunc(authAPI.GetSessionHandler))     //nolint:contextcheck
	authRouter.POST("/assume", WrapHandlerFunc(authAPI.PostAssumeHandler))     //nolint:contextcheck
	authRouter.DELETE("/assume", WrapHandlerFunc(authAPI.DeleteAssumeHandler)) //nolint:contextcheck
	authRouter.GET("/login", authAPI.GetLoginHandler)
	authRouter.GET("/callback", authAPI.GetCallbackHandler)
	authRouter.GET("/logout", authAPI.GetLogoutHandler)

	// data API endpoint
	router.Match(
		[]string{"HEAD", "GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		"/api/v0/*url",
		WrapHandler(http.StripPrefix("/api/v0", dataAPIHandler)), //nolint:contextcheck
	)

	// health check endpoints
	router.Match([]string{"GET", "HEAD"}, "/readyz", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	slog.InfoContext(ctx, "Running server on server on"+addr)

	err = router.RunWithContext(ctx)
	if err != nil {
		return fmt.Errorf("router failed: %w", err)
	}

	return nil
}
