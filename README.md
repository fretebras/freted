freted
========

FreteBras development CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/freted.svg)](https://npmjs.org/package/freted)
[![Downloads/week](https://img.shields.io/npm/dw/freted.svg)](https://npmjs.org/package/freted)
[![License](https://img.shields.io/npm/l/freted.svg)](https://gitlab.fretebras.com.br/dev/freted/blob/master/package.json)

<!-- toc -->
* [About](#about)
* [Requirements](#requirements)
* [Getting started](#getting-started)
* [Configuring services](#configuring-services)
* [CLI Usage](#cli-usage)
* [Commands](#commands)
<!-- tocstop -->

# About

`$ freted` uses Docker and Git to manage environments for local development of distributed systems. It works like a dependency manager (like Composer and npm) to resolve dependencies and start all on your local machine.

# Requirements

To use `freted` you need the following dependencies installed in your machine:
- Docker (with docker-compose)
- Git
- Node

# Getting started

To start using `freted`, follow those steps:

## 1. Install `freted`

```sh-session
$ npm install -g freted
```

## 2. Authenticate with GitLab

```sh-session
$ freted login
```

## 3. Update repositories list

Note: You should run this command periodically to keep the list updated.

```sh-session
$ freted update
```

## 3. Start a service

Pass the service name as an argumento to the `start` command. The service name is the path of the repository.

*For example, for the repository `https://gitlab.fretebras.com.br/web/global` the name is `web/global`.*

If the repository don't exists locally, `freted` will clone in your workspace.

*Your workspace will be at `~/Development`. The following directory tree will b e used to organize the projects:*

```
~/Development
  gitlab.fretebras.com.br
    web
      global
      fretebras-central
    inovacao
      website-2019
```

If you are working on a new project and it doesn't have a repository yet, `freted` will try to resolve the local directory of the project using the above directory tree.

```sh-session
$ freted start web/global
```

# Configuring services

In order to configure a project to run using `freted`, create a file in the project root named `freted.json` with a valid JSON content (like `{}`).

Besides that, the project must have a `docker-compose.yml` on the project root.

Set the following configurations as needed (all are optional):

## Host

Set the host on which the project can be accessed.

```
{
  "host": "http://global.fretebras.local"
}
```

## Dependencies

Set the list of services that the service depends of. The service names must follow the same naming convention explained before.

```
{
  "dependencies": [
    "web/database"
  ]
}
```

## Credentials

Set the default credentials that the developer can use to login in the system.

```
{
  "credentials": [
    {
      "description": "Active company VIP",
      "user": "fretebras",
      "password": "fretebras"
    }
  ]
}
```

## 3. HTTP entrypoint

`freted` uses Traefik to facilitate the organization and communication between all services. The Traefik container is automatically managed by `freted`.

If your service can be accessed through HTTP, edit the `docker-compose.yml` and set the following properties:

- Set any Traefik supported labels, for example:
```
labels:
  - traefik.http.routers.global.rule=Host(`global.fretebras.local`)
```
- Connect the service container to the Traefik network and configure the host as an alias:
```
networks:
  default:
  freted-network:
    aliases:
      - global.fretebras.local
```
- Reference the Traefik network to make it available to the local services:
```
networks:
  freted-network:
    external: true
```

*Note: By default, Traefik will use `EXPOSED` port defined on the project's `Dockerfile` to route the requests.*

A full example of the `docker-compose.yml` after the changes:
```
version: '3'

services:
  app:
    build: .
    networks:
      default:
      freted-network:
        aliases:
          - global.fretebras.local
    labels:
      - traefik.http.routers.global.rule=Host(`global.fretebras.local`)

networks:
  freted-network:
    external: true
```

# CLI Usage
<!-- usage -->
```sh-session
$ npm install -g freted
$ freted COMMAND
running command...
$ freted (-v|--version|version)
freted/0.0.4 darwin-x64 node-v12.17.0
$ freted --help [COMMAND]
USAGE
  $ freted COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`freted help [COMMAND]`](#freted-help-command)
* [`freted inspect SERVICE`](#freted-inspect-service)
* [`freted login`](#freted-login)
* [`freted logs`](#freted-logs)
* [`freted restart SERVICE`](#freted-restart-service)
* [`freted start SERVICE`](#freted-start-service)
* [`freted stop SERVICE`](#freted-stop-service)
* [`freted update`](#freted-update)

## `freted help [COMMAND]`

display help for freted

```
USAGE
  $ freted help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.0.1/src/commands/help.ts)_

## `freted inspect SERVICE`

inspect a service

```
USAGE
  $ freted inspect SERVICE

ARGUMENTS
  SERVICE  name of the service

EXAMPLE
  $ freted inspect web/site
```

## `freted login`

authenticate to supported providers

```
USAGE
  $ freted login

EXAMPLE
  $ freted login
```

## `freted logs`

show services logs

```
USAGE
  $ freted logs

EXAMPLE
  $ freted logs
```

## `freted restart SERVICE`

restart a service

```
USAGE
  $ freted restart SERVICE

ARGUMENTS
  SERVICE  name of the service to restart

EXAMPLE
  $ freted restart web/site
```

## `freted start SERVICE`

start a service

```
USAGE
  $ freted start SERVICE

ARGUMENTS
  SERVICE  name of the service to start

EXAMPLE
  $ freted start web/site
```

## `freted stop SERVICE`

stop a service

```
USAGE
  $ freted stop SERVICE

ARGUMENTS
  SERVICE  name of the service to stop

EXAMPLE
  $ freted stop web/site
```

## `freted update`

update repositories definitions

```
USAGE
  $ freted update

EXAMPLE
  $ freted update
```
<!-- commandsstop -->
