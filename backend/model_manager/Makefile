build-linux:
	GOOS=linux go build -o bin/model_manager

docker-build: build-linux
	docker build -t itselavia/edge-platform-model-manager .

docker-push: docker-build
	docker push itselavia/edge-platform-model-manager
	rm -rf bin/