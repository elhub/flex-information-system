_PHONY: dockerbuild dockerrun

# These targets are here just as a convenience.
dockerbuild:
	docker build -t flex-information-system-frontend .
	bash -c 'grep flex-information-system-frontend <(docker image list)'

dockerrun:
	@echo "visit http://localhost:8080"
	docker run -p 8080:8080 flex-information-system-frontend
