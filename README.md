# freted

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/freted.svg)](https://npmjs.org/package/freted)
[![Downloads/week](https://img.shields.io/npm/dw/freted.svg)](https://npmjs.org/package/freted)
[![License](https://img.shields.io/github/license/fretebras/freted)](https://github.com/fretebras/freted/blob/master/LICENSE.md)

<!-- toc -->
* [freted](#freted)
<!-- tocstop -->

## About
`$ freted` uses manages environments for local development of distributed systems. It works like a dependency manager (like Composer and npm) to resolve dependencies and start all on your local machine.

## Technology
- Node
- Oclif
- TypeScript

## Requirements
To use `freted` you need the following dependencies installed in your machine:
- Git
- Node

## Getting started
To start using `freted`, follow those steps:

### 1. Install `freted`

#### Using NPM

```shell
$ npm install -g freted
```

### 2. Authenticate with GitLab or GitHub
```shell
$ freted login
```

### 3. Start a service
Enter the service name as an argument to the `start` command. The service name is URL of the repository without the protocol.  
*For example, for the repository `https://github.com/web/xyz` the name is `github.com/web/xyz`.*

If the repository don't exists locally, `freted` will clone in your workspace if you granted your credentials using `$ freted login`.

If you are working on a new project and it doesn't have a repository yet, `freted` will try to resolve the local directory within your workspace.

```shell
$ freted start github.com/web/xyz
```

## Configuring services
To allow a project to be run with `freted`, create a file on the root of your project named `freted.yml` with the following content:

```yaml
name: github.com/web/xyz
description: My awesome project
```

You can find a full example of a config file on the repository.

### Commands

You can define the commands to setup, start, stop and test your services.

- **setup**: will be run when you start the service for the first time.
- **start**: will be run when you start the service.
- **stop**: will be run when you stop the service.

```yaml
setup:
  - docker-compose build

start:
  - docker-compose up -d

stop:
  - docker-compose down

test:
  - docker-compose exec app yarn test
```

### Dependencies
`freted` is also a dependency manager. If you have a service (like a SPA) that depends on another (like an API), you can declare this dependency on `freted.yml`:

```yaml
dependencies:
  - github.com/web/xyz

optionalDependencies:
  - github.com/web/xyz
```

### Credentials and instructions
You can use the `freted.yml` to put default credentials and quick notes for the developers. Those instructions will be shown on the terminal after the application starts.

```yaml
instructions:
  - Sign-in using one of the credentials provided.

credentials:
  - name: Active user
    description: User active on the app
    email: foo@bar.com
    password: mysecretpass
```

### HTTP entrypoint
`freted` uses Traefik to facilitate the organization and communication between all services. The Traefik container is automatically managed by `freted`.

If your service can be accessed through HTTP, edit the `freted.yml` and add the following config:

```yaml
routes:
  - host: myproject.myorg.local
    backend: docker
    destination: mycontainer_app
    port: 80
```

*The field `destination` must be the name of the running container. With docker compose, set the field `container_name` on the service and use the same name here.*

## CLI Usage
<!-- usage -->
```sh-session
$ npm install -g freted
$ freted COMMAND
running command...
$ freted (-v|--version|version)
freted/0.2.0 linux-x64 node-v14.13.1
$ freted --help [COMMAND]
USAGE
  $ freted COMMAND
...
```
<!-- usagestop -->

### Commands
<!-- commands -->
* [`freted configure`](#freted-configure)
* [`freted help [COMMAND]`](#freted-help-command)
* [`freted inspect SERVICE`](#freted-inspect-service)
* [`freted login`](#freted-login)
* [`freted logs`](#freted-logs)
* [`freted restart SERVICE`](#freted-restart-service)
* [`freted start SERVICE`](#freted-start-service)
* [`freted stop SERVICE`](#freted-stop-service)

## `freted configure`

configure freted

```
USAGE
  $ freted configure

EXAMPLE
  $ freted configure
```

_See code: [src/commands/configure.ts](https://github.com/fretebras/freted/blob/v0.2.0/src/commands/configure.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `freted inspect SERVICE`

inspect a service

```
USAGE
  $ freted inspect SERVICE

ARGUMENTS
  SERVICE  name of the service

EXAMPLE
  $ freted inspect github.com/myorg/myproject
```

_See code: [src/commands/inspect.ts](https://github.com/fretebras/freted/blob/v0.2.0/src/commands/inspect.ts)_

## `freted login`

authenticate to supported providers

```
USAGE
  $ freted login

EXAMPLE
  $ freted login
```

_See code: [src/commands/login.ts](https://github.com/fretebras/freted/blob/v0.2.0/src/commands/login.ts)_

## `freted logs`

show services logs

```
USAGE
  $ freted logs

EXAMPLE
  $ freted logs
```

_See code: [src/commands/logs.ts](https://github.com/fretebras/freted/blob/v0.2.0/src/commands/logs.ts)_

## `freted restart SERVICE`

restart a service

```
USAGE
  $ freted restart SERVICE

ARGUMENTS
  SERVICE  name of the service to restart

EXAMPLE
  $ freted restart github.com/myorg/myproject
```

_See code: [src/commands/restart.ts](https://github.com/fretebras/freted/blob/v0.2.0/src/commands/restart.ts)_

## `freted start SERVICE`

start a service

```
USAGE
  $ freted start SERVICE

ARGUMENTS
  SERVICE  name of the service to start

OPTIONS
  --no-dependencies           don't start service dependencies
  --no-optional-dependencies  don't start service optional dependencies

EXAMPLE
  $ freted start github.com/myorg/myproject
```

_See code: [src/commands/start.ts](https://github.com/fretebras/freted/blob/v0.2.0/src/commands/start.ts)_

## `freted stop SERVICE`

stop a service

```
USAGE
  $ freted stop SERVICE

ARGUMENTS
  SERVICE  name of the service to stop

OPTIONS
  --no-dependencies           don't start service dependencies
  --no-optional-dependencies  don't start service optional dependencies

EXAMPLE
  $ freted stop github.com/myorg/myproject
```

_See code: [src/commands/stop.ts](https://github.com/fretebras/freted/blob/v0.2.0/src/commands/stop.ts)_
<!-- commandsstop -->
