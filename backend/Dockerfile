# backend - build for production
# https://docs.docker.com/guides/golang/build-images/
FROM docker.jfrog.elhub.cloud/golang:1.25.7-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /flex ./cmd/flex

# --- Run Stage ---
# Deploy the application binary into a lean image
FROM docker.jfrog.elhub.cloud/distroless/static:latest AS final

WORKDIR /

COPY --from=builder /flex /flex

EXPOSE 7001

USER nonroot:nonroot

ENTRYPOINT ["/flex"]
