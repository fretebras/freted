freted
========

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/freted.svg)](https://npmjs.org/package/freted)
[![Downloads/week](https://img.shields.io/npm/dw/freted.svg)](https://npmjs.org/package/freted)
[![License](https://img.shields.io/npm/l/freted.svg)](https://gitlab.fretebras.com.br/dev/freted/blob/master/package.json)

<!-- toc -->
* [About](#about)
* [Technology](#technology)
* [Requirements](#requirements)
* [Getting started](#getting-started)
* [Configuring services](#configuring-services)
* [CLI Usage](#cli-usage)
* [Commands](#commands)
<!-- tocstop -->

# About

`$ freted` uses Docker and Git to manage environments for local development of distributed systems. It works like a dependency manager (like Composer and npm) to resolve dependencies and start all on your local machine.

# Technology

- Node
- Oclif
- TypeScript

# Requirements

To use `freted` you need the following dependencies installed in your machine:
- Docker (with docker-compose)
- Git
- Node

# Getting started

To start using `freted`, follow those steps:

## 1. Install `freted`

### Linux and Mac

Clone the project and install npm dependencies:

```sh-session
$ git clone git@gitlab.fretebras.com.br:dev/freted.git ~/Development/gitlab.fretebras.com.br/dev/freted
$ cd ~/Development/gitlab.fretebras.com.br/dev/freted
$ yarn
```

Create an alias to use the cli from anywhere (add to your `.bashrc`, `.zshrc`, etc):

```
alias freted=~/Development/gitlab.fretebras.com.br/dev/freted/bin/run
```

## 2. Authenticate with GitLab

```sh-session
$ freted login
```

## 3. Start a service

Enter the service name as an argument to the `start` command. The service name is the path of the repository.

*For example, for the repository `https://gitlab.fretebras.com.br/web/global` the name is `web/global`.*

If the repository don't exists locally, `freted` will clone in your workspace.

*Your workspace will be at `~/Development`. The following directory tree will be used to organize the projects:*

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

Any repositories that have a `docker-compose.yml` can be started using `freted`.

To use additional features of `freted`, the following configurations can be made:

## Dependencies

`freted` is also a dependency manager. If you have a service (like a SPA) that depends on another (like an API), you can declare this dependency on the project's `README.md`:

```
<!-- dependencies -->
[dev/database](https://gitlab.fretebras.com.br)
<!-- dependenciesstop -->
```

All links inside the `dependencies` section will be considered as dependencies and will be automatically started.  
*Note: At this moment, only the link label will be used to resolve the dependencies. For this reason, the label must be the service name following the same naming convention presented above.*

## Credentials and instructions

The `welcome` section will be rendered on the terminal after the start of the service. It's a good place to put default credentials and quick notes for the developers.

```
<!-- welcome -->
Use those credentials to login:
Active company: user@company.com - 123456
Suspended company: user-suspended@company.com - 123456
<!-- welcomestop -->
```

## 3. HTTP entrypoint

`freted` uses Traefik to facilitate the organization and communication between all services. The Traefik container is automatically managed by `freted`.

If your service can be accessed through HTTP, edit the `docker-compose.yml` and set the following label to the container that has a HTTP server:

```
labels:
  - freted.host=global.fretebras.local
```

*Note: By default, Traefik will use the `EXPOSED` port defined on the project's `Dockerfile` to route the requests.*

# CLI Usage
<!-- usage -->
```sh-session
$ npm install -g freted
$ freted COMMAND
running command...
$ freted (-v|--version|version)
freted/0.0.6 darwin-x64 node-v12.17.0
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

OPTIONS
  --build                     rebuild containers before start
  --no-dependencies           don't start service dependencies
  --no-optional-dependencies  don't start service optional dependencies

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
<!-- commandsstop -->
