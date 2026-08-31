

<div align="center">
  <p>
    <img src="./assets/os-logo.png" width="160" alt="OpenSearch Logo" />
    <b></b>
    <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" />
  </p>
  <p>
    <a href="https://opensearch.org/" target="blank">OpenSearch</a> módulo y servicio para <a href="https://github.com/nestjs/nest" target="blank">Nest</a>,<br>
    un framework progresivo de Node.js para crear aplicaciones del lado del servidor eficientes y escalables.
  </p>
  <p>
    <a href="https://www.npmjs.com/@andreafspeziale/nestjs-search" target="_blank"><img src="https://img.shields.io/npm/v/@andreafspeziale/nestjs-search" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/@andreafspeziale/nestjs-search" target="_blank"><img src="https://img.shields.io/npm/l/@andreafspeziale/nestjs-search.svg" alt="Package License" /></a>
    <a href="https://github.com/andreafspeziale/nestjs-search/actions" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/andreafspeziale/nestjs-search/test.yml" alt="Test Status"/></a>
  <p>
</div>

## Instalación

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

## Dependencias de pares (Peer Dependencies)

`@nestjs/common` y `reflect-metadata` son dependencias de pares obligatorias que, estoy bastante seguro, ya están instaladas en el 99 % de las aplicaciones de NestJS.

Logré configurar `@aws-sdk/credential-providers` como opcional utilizando `imports dinámicos` y lanzando un error si intentas usar el método de conexión `ServiceAccount` sin instalarlo.

Además del módulo y el cliente inyectable, puedes importar y utilizar las siguientes características tan pronto como agregues la dependencia de par correspondiente:

- exportar un `OSHealthIndicator` para tu servidor, que requiere `@nestjs/terminus`
- analizadores/validadores de variables de entorno (eventualmente utilizando y requiriendo `zod`)

Consulta los siguientes capítulos para obtener más información sobre las características mencionadas anteriormente.

### Requeridas

- `@nestjs/common`
- `reflect-metadata`

### Opcionales

- `@aws-sdk/credential-providers`
- `@nestjs/terminus`
- `zod`

## ¿Cómo utilizarlo?

### Módulo

El módulo es <a href="https://docs.nestjs.com/modules#global-modules" target="blank">Global</a> por defecto.

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

Según tus necesidades de conexión, debes proporcionar un objeto de configuración:

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

Puedes personalizar las necesidades de tu consumidor aprovechando los genéricos:

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

### Decoradores
> utiliza el cliente y crea tu propio servicio

#### InjectOSModuleOptions() y InjectOS()

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

> NestJS 11 modificó ligeramente los [indicadores de salud personalizados](https://docs.nestjs.com/migration-guide#terminus-module). `OSHealthIndicator` y `OldOSHealthIndicator` están a tu disposición

Por lo general, expongo un controlador `/healthz` desde mis microservicios para verificar la conexión con terceros.

`nestjs-search` expone un indicador de salud desde una ruta separada que espera que `@nestjs/terminus` esté instalado en tu proyecto.

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

### Gestión de variables de entorno

Como se mencionó anteriormente, por lo general inicializo mis `DynamicModule`s de NestJS inyectando el `ConfigService` expuesto por `ConfigModule` (paquete `@nestjs/config`). Aquí es donde analizo mis variables de entorno utilizando una biblioteca a mi elección (he experimentado principalmente con `joi`, `class-transformer/class-validator` y `zod`).

Aún puedes implementar tu flujo de análisis/validación favorito, pero vale la pena mencionar que `nestjs-search` expone algunas características relacionadas y convenientes desde rutas distintas para evitar obligarte a instalar paquetes que nunca utilizarás.

Así que supongamos que vas a analizar tus variables de entorno utilizando las características relacionadas con `zod` de `nestjs-search`; asumo que `zod` ya está instalado en tu proyecto.

#### Zod

> Recientemente simplifiqué la librería exponiendo solo Zod como herramienta de análisis de variables de entorno

Consulta mi <a href="https://github.com/andreafspeziale/os-cli" target="blank">os-cli</a> como ejemplo de análisis de variables de entorno con `zod`.

## Pruebas

- `pnpm test`

## Mantente en contacto

- Autor - [Andrea Francesco Speziale](https://twitter.com/andreafspeziale)
- Sitio web - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Licencia

nestjs-search con [licencia MIT](LICENSE).
