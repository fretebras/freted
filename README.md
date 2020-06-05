freted
========

FreteBras development CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/freted.svg)](https://npmjs.org/package/freted)
[![Downloads/week](https://img.shields.io/npm/dw/freted.svg)](https://npmjs.org/package/freted)
[![License](https://img.shields.io/npm/l/freted.svg)](https://gitlab.fretebras.com.br/dev/freted/blob/master/package.json)

# About

`$ freted` uses Docker and Git to manage environments for local development of distributed systems. It works like a dependency manager (like Composer and npm) to resolve dependencies and start all on your local machine.

# Requirements

To use `freted` you need the following dependencies installed in your machine:
- Docker (with docker-compose)
- Git
- Node

<!-- toc -->
* [About](#about)
* [Requirements](#requirements)
* [Getting started](#getting-started)
* [Commands](#commands)
<!-- tocstop -->
# Getting started
<!-- usage -->
```sh-session
$ npm install -g freted
$ freted COMMAND
running command...
$ freted (-v|--version|version)
freted/0.0.2 darwin-x64 node-v12.17.0
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
