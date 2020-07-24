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
## Test
##

test-demo: ## generate the demo schema
	node src/index -s ./test/demo/schema.yaml -o ./test/demo/output/
