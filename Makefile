ORG                     := automatethethingsllc

REPO                    ?= github.com
PACKAGE                 ?= go-trusted-platform-web
APPNAME                 ?= trusted-platform-webapp

BUILD_DATE              = $(shell date '+%Y-%m-%d_%H:%M:%S')

VERSION_FILE            ?= VERSION

ENV                     ?= dev

RPI_HOST                ?= rpi

GREEN=\033[0;32m
NO_COLOR=\033[0m

WEB_PUBLIC_HTML         ?= ../go-trusted-platform/public_html

.PHONY: build run

default: dev

dev:
	yarn run dev

rpi-sync:
	rsync -av --progress ../$(PACKAGE) $(RPI_HOST): --exclude ./.git/