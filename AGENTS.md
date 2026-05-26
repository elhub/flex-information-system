# AGENTS.md

## Project Overview

Flexibility Information System -- a full-stack application with a Go backend (Gin + stdlib HTTP),
React/TypeScript frontend (react-admin + Vite), PostgreSQL database (Liquibase migrations + PostgREST),
and Python integration tests (pytest). Uses `just` as the task runner.

## Build / Lint / Test Commands

### Environment

```bash
just init          # One-time setup: venv, Java, Liquibase, keypairs, pre-commit hooks
just start         # Start Docker environment (Postgres, PostgREST, etc.)
just load          # Run Liquibase migrations + seed test data
just reload        # Unload + load (reset DB to clean state)
just reset         # Full reset: down, pull, build, start, load
```

### Backend (Go) -- run from `backend/`

```bash
cd backend && go build ./cmd/flex       # Build
cd backend && golangci-lint run --fix   # Lint (all linters enabled by default, see .golangci.yml)
cd backend && go test -tags=unit -timeout 30s -short -v  # Unit tests
cd backend && go test -tags=unit -run TestFunctionName ./path/to/package  # Single test
just backend                            # Run backend in dev mode (uses air for hot reload)
```

### Frontend (TypeScript/React) -- run from `frontend/`

```bash
cd frontend && pnpm run dev              # Dev server (HTTPS on dev.flex.internal:5443)
cd frontend && pnpm run build            # Production build (vite build)
cd frontend && pnpm run lint             # ESLint --fix
cd frontend && pnpm run type-check       # tsc --noEmit
cd frontend && pnpm run format           # Prettier
```

### Integration Tests (Python) -- run from repo root

```bash
just test                               # Run ALL tests (api + auth + other)
just test --api                         # Run all API tests
just test --api cu                      # Run API tests matching pattern "cu"
just test --auth                        # Run all auth tests
just test --auth token_exchange         # Run auth tests matching pattern
just pytest test/api_client_tests/test_cu.py                        # Single file
just pytest test/api_client_tests/test_cu.py::test_function_name    # Single function
just pytest test/api_client_tests/test_cu.py -k "keyword"           # Keyword filter
just coverage                           # Check endpoint + RLS test coverage
```

### Linting (all languages)

```bash
just lint          # Run all linters (pre-commit, tbls, gitleaks, secretlint, megalinter)
just pre-commit    # Run pre-commit hooks on all files
```

### Code Generation (run after changing openapi/resources.yml)

```bash
just openapi       # Full pipeline: OpenAPI spec -> DB schemas -> sqlc -> clients -> intl
just sqlc          # Regenerate Go query code from SQL (backend/data/models/, backend/event/models/)
just generate      # Run go generate ./... (oapi-codegen, enumer)
```

## Architecture

```
backend/           Go backend (module name: "flex")
  cmd/flex/        Entrypoint: main.go calls flex.Run()
  auth/            Auth API (Gin handlers): /auth/v0/*
  data/            Data API (stdlib http.ServeMux): PostgREST proxy + custom endpoints
  event/           Background event worker (polling loop)
  pgpool/          Database connection pool with role impersonation
  internal/        Shared utilities (middleware, tracing, validation)
frontend/          React SPA (react-admin + Vite + Tailwind CSS v4)
  src/generated-client/  AUTO-GENERATED -- never edit
db/                Liquibase SQL migrations
  flex/            Core domain tables, RLS policies, triggers, history tables
  api/             PostgREST views + INSTEAD-OF triggers (dropped & recreated each migration)
  auth/            Authentication functions (pre-request hook, credential lookup)
test/              Python integration tests (pytest)
  flex/            AUTO-GENERATED Python client -- never edit
  security_token_service.py  Auth helper (singleton, creates OAuth2 tokens for test roles)
openapi/           OpenAPI specs and resource definitions (source of truth)
```

## Code Style -- Go (backend/)

Migrating from Gin to stdlib `net/http`. New code must use stdlib handlers. Never add new Gin
dependencies. See `.opencode/skills/backend-code-style/SKILL.md` for full conventions, migration
patterns, and handler examples.

## Code Style -- TypeScript/React (frontend/)

Migrating from react-admin's MUI layer to ra-core + Elhub Design System (EDS). New pages must use
the `components/EDS-ra/` wrappers and `components/ui/` re-exports -- never import `@elhub/ds-components`
directly. See `.opencode/skills/frontend-code-style/SKILL.md` for component architecture, migration
status, and form patterns.

## Code Style -- Python (test/)

pytest with `SecurityTokenService` for auth. ruff-format + pyright. Coverage tracked via
`# endpoint:` and `# RLS:` comments. See `.opencode/skills/python-test-style/SKILL.md` for
fixture patterns, assertion style, and test isolation guidance.

## Code Style -- SQL (db/)

PostgreSQL with sqlfluff formatting. `flex.*` tables with RLS, `api.*` views dropped and recreated
each migration. ~31% of API views are auto-generated from `openapi/resources.yml`. See
`.opencode/skills/sql-code-style/SKILL.md` for naming conventions, migration patterns, and the
generated-vs-manual split.

## Commit Conventions

Conventional commits enforced by pre-commit hook (strict mode):
`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`.
Issue number is auto-prepended from branch name.

**Never force push.** If a commit needs to be updated after it has been pushed, create a new
commit instead of amending and force pushing.

## Key Architectural Notes

- PostgREST serves as the primary data API; the Go backend proxies and extends it.
- Row-Level Security (RLS) on `flex.*` tables + column-level GRANTs on `api.*` views
  enforce authorization at the database level.
- The Go `pgpool` package impersonates PostgreSQL roles per-request (like PostgREST).
- OpenAPI spec in `openapi/resources.yml` is the source of truth -- it drives DB schemas,
  Go query code (sqlc), Python test client, TypeScript client, frontend types/Zod schemas,
  field labels, and documentation.
