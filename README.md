<div align="center">
  <p>
    <img src="./assets/os-logo.png" width="160" alt="OpenSearch Logo" />
    <b></b>
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" />
  </p>
  <p>
    <a href="https://opensearch.org/" target="blank">OpenSearch</a> module and service for <a href="https://github.com/nestjs/nest" target="blank">Nest</a>,<br>
    a progressive Node.js framework for building efficient and scalable server-side applications.
  </p>
  <p>
    <a href="https://www.npmjs.com/@andreafspeziale/nestjs-search" target="_blank"><img src="https://img.shields.io/npm/v/@andreafspeziale/nestjs-search" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/@andreafspeziale/nestjs-search" target="_blank"><img src="https://img.shields.io/npm/l/@andreafspeziale/nestjs-search.svg" alt="Package License" /></a>
    <a href="https://github.com/andreafspeziale/nestjs-search/actions" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/andreafspeziale/nestjs-search/test.yml" alt="Test Status"/></a>
  <p>
</div>

## Installation

### npm

```sh
npm install @andreafspeziale/nestjs-search
```

### yarn

```sh
yarn add @andreafspeziale/nestjs-search
```

### pnpm

```sh
pnpm add @andreafspeziale/nestjs-search
```

## Peer Dependencies

`@nestjs/common` and `reflect-metadata` are required peer dependencies which I'm pretty sure 99% of NestJS applications out there have already installed.

I managed to setup `@aws-sdk/credential-providers` as optional using `dynamic imports` and throwing an error if you try to use the `ServiceAccount` connection method without installing it.

In addition to the module and the injectable client you can import and use the following features as soon as you add the related peer dependency:

- exporting an `OSHealthIndicator` for your server which requires `@nestjs/terminus`
- environment variables parsers/validators (eventually using and requiring `zod`)

Check the next chapters for more info of the above mentioned features.

### Required

- `@nestjs/common`
- `reflect-metadata`

### Optional

- `@aws-sdk/credential-providers`
- `@nestjs/terminus`
- `zod`

## How to use?

### Module

The module is <a href="https://docs.nestjs.com/modules#global-modules" target="blank">Global</a> by default.

#### OSModule.forRoot(options)

`src/core/core.module.ts`

```ts
import { Module } from '@nestjs/common';
import {
  ConnectionMethod,
  OSModule,
  OS_HOST,
} from '@andreafspeziale/nestjs-search';

@Module({
  imports: [
    OSModule.forRoot({
      host: OS_HOST,
      connectionMethod: ConnectionMethod.Local,
    }),
  ],
  ....
})
export class CoreModule {}
```

#### OSModule.forRootAsync(options)

`src/core/core.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OSModule } from '@andreafspeziale/nestjs-search';
import { Config } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ....
    }),
    OSModule.forRootAsync({
      useFactory: (cs: ConfigService<Config, true>) => cs.get<Config['os']>('os'),
      inject: [ConfigService],
    }),
  ],
  ....
})
export class CoreModule {}
```

Based on your connection needs a config object must be provided:

```ts
export interface OSConfig<
  T extends Local | Proxy | ServiceAccount | Credentials =
    | Local
    | Proxy
    | ServiceAccount
    | Credentials,
> {
  os: OSModuleOptions<T>;
}
```

You can customize your consumer needs leveraging generics:

`src/config/config.interfaces.ts`

```ts
import {
  Local,
  OSConfig,
  ServiceAccount,
} from '@andreafspeziale/nestjs-search';

....
// Your config supporting only "Local" and "ServiceAccount" connection methods
export type Config = OSConfig<Local | ServiceAccount> & ....;
```

### Decorators
> use the client and create your own service

#### InjectOSModuleOptions() and InjectOS()

`src/samples/samples.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { InjectOS, InjectOSModuleOptions, OSModuleOptions, OSTypes } from '@andreafspeziale/nestjs-search';

@Injectable()
export class SamplesService {
  constructor(
    @InjectOSModuleOptions() private readonly osModuleOptions: OSModuleOptions, // Showcase purposes
    @InjectOS() private readonly osClient: OSTypes.Client
  ) {}

  ....
}
```

### Health

> NestJS 11 slightly changed [custom heath indicators](https://docs.nestjs.com/migration-guide#terminus-module). `OSHealthIndicator` and `OldOSHealthIndicator` are at your disposal

I usually expose an `/healthz` controller from my microservices in order to check third parties connection.

`nestjs-search` exposes from a separate path an health indicator which expects `@nestjs/terminus` to be installed in your project.

#### HealthModule

`src/health/health.module.ts`

```ts
import { OSHealthIndicator } from '@andreafspeziale/nestjs-search/dist/health';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [OSHealthIndicator],
})
export class HealthModule {}
```

#### HealthController

`src/health/health.controller.ts`

```ts
import { Controller, Get } from '@nestjs/common';
import { OSHealthIndicator } from '@andreafspeziale/nestjs-search/dist/health';
import {
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';

@Controller('healthz')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private openSearchHealthIndicator: OSHealthIndicator,
  ) {}

  @Get()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.openSearchHealthIndicator.isHealthy('opensearch'),
    ]);
  }
}
```

### Environment variables management

As mentioned above I usually init my NestJS `DynamicModule`s injecting the `ConfigService` exposed by the `ConfigModule` (`@nestjs/config` package). This is where I parse my environment variables using a library of my choice (I've been mostly experimenting with `joi`, `class-transformer/class-validator` and `zod`).

You can still implement your favorite parsing/validation flow but it's worth to mention that `nestjs-search` exposes some related and convenient features from distinct paths in order to avoid to force you install packages you'll never going to use.

So let's pretend you are goingo to parse your environment variables using the `nestjs-search` `zod` related features, I expect `zod` to be already installed in you project.

#### Zod

> I recently simplified the lib by exposing only Zod as environment variables parsing toolkit

Check my <a href="https://github.com/andreafspeziale/os-cli" target="blank">os-cli</a> as `zod` environment variables parsing example.

## Test

- `pnpm test`

## Stay in touch

- Author - [Andrea Francesco Speziale](https://twitter.com/andreafspeziale)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

nestjs-search [MIT licensed](LICENSE).
