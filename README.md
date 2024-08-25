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

In order to create `nestjs-search` I had to address multiple challenges which lead me to the current module and features setup.

The first challenge was an annoying Tyepscript inference issue. Returning inferenced `@opensearch-project/opensearch` client return types from providers functions was raising a "not portable types" error. I unsuccessfully tried to fix it by exporting all the client types from `nestjs-search`, so I ended up asking to the consumer to install the opensearch client. I also decided to ask to the consumer to "statically" add the `Client` class implementation to the module option as a convenient way to ensure `@opensearch-project/opensearch` installation along with other benefits.

`@nestjs/common` and `reflect-metadata` are required peer dependencies which I'm pretty sure 99% of NestJS applications out there have already installed.

I managed to setup `@aws-sdk/credential-providers` as optional using `dynamic imports` and throwing an error if you try to use the `ServiceAccount` connection method without installing it.

In addition to the module and the injectable client you can import and use the following features as soon as you add the related peer dependency:

- exporting an `OSHealthIndicator` for your server which requires `@nestjs/terminus`
- environment variables parsers/validators:
  - eventually using and requiring `zod`
  - eventually using and requiring `class-transformer` and `class-validator`

Check the next chapters for more info of the above mentioned features.

### Required

- `@nestjs/common`
- `reflect-metadata`
- `@opensearch-project/opensearch`

### Optional

- `@aws-sdk/credential-providers`
- `@nestjs/terminus`
- `class-transformer`
- `class-validator`
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
import { Client } from '@opensearch-project/opensearch';

@Module({
  imports: [
    OSModule.forRoot({
      host: OS_HOST,
      client: Client,
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
import { InjectOS, InjectOSModuleOptions, OSModuleOptions } from '@andreafspeziale/nestjs-search';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class SamplesService {
  constructor(
    @InjectOSModuleOptions() private readonly osModuleOptions: OSModuleOptions, // Showcase purposes
    @InjectOS() private readonly osClient: Client
  ) {}

  ....
}
```

### Health

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

Check my <a href="https://github.com/andreafspeziale/os-cli" target="blank">os-cli</a> as `zod` environment variables parsing example.

#### Class transformer/validator

When:

- using `class-transformer/class-validator` to parse environment variables
- customizing `OSConfig` with generics

you'll need to tweak a little bit parsing/validation flow.

`src/config/config.interfaces.ts`

```ts
import {
  Local,
  OSConfig,
  ServiceAccount,
} from '@andreafspeziale/nestjs-search';
import { IOSLocalSchema, IOSServiceAccountSchema } from '@andreafspeziale/nestjs-search/dist/class-validator';

....
// Your application config supporting only "Local" and "ServiceAccount" connection methods
export type Config = SomeLocalConfig & OSConfig<Local | ServiceAccount> & SomeOtherConfig;

....
// Shape of your application the ENV variables
export type ENVSchema = ISomeLocalSchema &
  ISomeOtherSchema &
  (IOSLocalSchema | IOSServiceAccountSchema);
```

`src/config/config.utils.ts`

```ts
import {
  instanceToPlain,
  plainToInstance,
  ClassConstructor,
} from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { OSLocalSchema, OSServiceAccountSchema } from '@andreafspeziale/nestjs-search/dist/class-validator';
import { ConfigException } from './config.exceptions';
import { Config, ENVSchema } from './config.interfaces';
import { SomeLocalSchema, SomeOtherSchema } from './config.schema';

// You'll need to treat OSLocalSchema and OSServiceAccountSchema as OR chained schemas
export const parse = (e: Record<string, unknown>): ENVSchema => {
  let r = {};

  const schemaGroups: ClassConstructor<
    SomeLocalSchema | OSLocalSchema | OSServiceAccountSchema | SomeOtherSchema
  >[][] = [
    [SomeLocalSchema],
    [OSLocalSchema, OSServiceAccountSchema],
    [SomeOtherSchema],
  ];

  for (const schemaGroup of schemaGroups) {
    const groupValidationErrors: ValidationError[][] = [];

    for (const schema of schemaGroup) {
      const i = plainToInstance(schema, e, {
        enableImplicitConversion: true,
      });

      const errors = validateSync(i, {
        whitelist: true,
      });

      if (errors.length) {
        groupValidationErrors.push(errors);
      } else {
        r = {
          ...i,
          ...r,
        };
      }
    }

    if (groupValidationErrors.length === schemaGroup.length) {
      const details: string[] = [];

      for (const groupValidation of groupValidationErrors.flat()) {
        details.push(
          ...Object.values(groupValidation.constraints || 'Unknown constraint'),
        );
      }

      throw new ConfigException({
        message: 'Error validating ENV variables',
        details,
      });
    }
  }

  return instanceToPlain(r, { exposeUnsetFields: true }) as ENVSchema;
};

export const mapConfig = (e: ENVSchema): Config => {
  ....
  if (e.OS_CONNECTION_METHOD === ConnectionMethod.ServiceAccount) {
    return {
      os: {
        host: e.OS_HOST,
        client: Client,
        connectionMethod: e.OS_CONNECTION_METHOD,
        region: e.AWS_REGION as string,
        credentials: {
          arn: e.AWS_ROLE_ARN as string,
          tokenFile: e.AWS_WEB_IDENTITY_TOKEN_FILE as string,
        },
      },
      ...baseConfig,
    };
  }

  return {
    os: {
      host: e.OS_HOST,
      client: Client,
      connectionMethod: e.OS_CONNECTION_METHOD,
    },
    ...baseConfig,
  };
}
```

`src/core/core.module.ts`

```ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OSModule } from '@andreafspeziale/nestjs-search';
import { parse, mapConfig, Config } from '../config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (c) => mapConfig(parse(c)),
    }),
    OSModule.forRootAsync({
      useFactory: (cs: ConfigService<Config, true>) => cs.get<Config['os']>('os'),
      inject: [ConfigService],
    }),
  ],
})
export class CoreModule {}
```

## Test

- `pnpm test`

## Stay in touch

- Author - [Andrea Francesco Speziale](https://twitter.com/andreafspeziale)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

nestjs-search [MIT licensed](LICENSE).
