ROOT:=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))
.PHONY: help
.DEFAULT_GOAL := help

RED="\033[1;31m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
NOCOLOR="\033[0m\033[K"

##
## Generic utilites
##
help: ## Display enhanced help message
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-15s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

##
## NPM utilites
##
clean: ## install dependencies
	yarn
bump: ## bump version
	npm version patch
	git push

publish: ## publish to npm
	npm publish

##
## Test MySQL
##
test-demo-mysql: ## generate the demo schema for mysql
	node src/index -s ./test/demo/mysql/schema.yaml -o ./test/demo-output/mysql/

##
## Test Ts-Webapi
##
ts-webapi-demo-generate: ## generate the demo schema for mysql
	node src/index -s ./test/demo/ts-webapi/schema.yaml -o ./test/demo-output/ts-webapi/
ts-webapi-demo-clean: ## install requirements
	yarn --cwd ./test/demo-output/ts-webapi/src
ts-webapi-demo-build: ## build ts-webapi-demo
	cd ./test/demo-output/ts-webapi/src; tsc
ts-webapi-demo-test: ts-webapi-demo-generate ts-webapi-demo-clean ts-webapi-demo-build ## test ts-webapi
	cd ./test/demo-output/ts-webapi/src/build; node index.js
