import { DynamicModule, Global, Provider } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { OSModuleAsyncOptions, OSModuleOptions } from './os.interfaces';
import { createOSClient, getOSClientToken, getOSModuleOptionsToken } from './os.utils';

@Global()
export class OSModule {
  public static forRoot(options: OSModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: getOSModuleOptionsToken(),
      useValue: options,
    };

    const clientProvider: Provider = {
      provide: getOSClientToken(),
      useValue: createOSClient(options),
    };

    return {
      module: OSModule,
      providers: [optionsProvider, clientProvider],
      exports: [optionsProvider, clientProvider],
    };
  }

  static register(options: OSModuleOptions): DynamicModule {
    return OSModule.forRoot(options);
  }

  public static forRootAsync(options: OSModuleAsyncOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: getOSModuleOptionsToken(),
      useFactory: options.useFactory,
      inject: options.inject,
    };

    const clientProvider: Provider = {
      provide: getOSClientToken(),
      useFactory: (opts: OSModuleOptions): Client => createOSClient(opts),
      inject: [getOSModuleOptionsToken()],
    };

    return {
      module: OSModule,
      providers: [optionsProvider, clientProvider],
      exports: [optionsProvider, clientProvider],
    };
  }

  static registerAsync(options: OSModuleAsyncOptions): DynamicModule {
    return OSModule.forRootAsync(options);
  }
}
