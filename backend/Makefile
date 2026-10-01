_PHONY: build check dockerbuild dockerrun
# This makefile is used in CI/CD with makeVerify

build:
	go build -o build/flex ./cmd/flex

# if (!settings.disableUnitTest)
check:
	go test ./...

# These targets are here just as a convenience.
#
dockerbuild:
	docker build -t flex-information-system-backend .
	bash -c 'grep flex-information-system-backend <(docker image list)'

dockerrun:
	docker run -p 7901:7001 flex-information-system-backend
