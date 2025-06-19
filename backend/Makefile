_PHONY: build check
# This makefile is used in CI/CD with makeVerify

build:
	go build -o build/flex ./cmd/flex

# if (!settings.disableUnitTest)
check:
	go test ./...
