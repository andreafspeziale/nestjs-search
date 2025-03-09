import { DynamicModule, Global, Provider } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { OSModuleAsyncOptions, OSModuleOptions, OSModuleOptionsFactory } from './os.interfaces';
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
    const clientProvider: Provider = {
      provide: getOSClientToken(),
      useFactory: (opts: OSModuleOptions): Client => createOSClient(opts),
      inject: [getOSModuleOptionsToken()],
    };

    return {
      module: OSModule,
      providers: [...this.createAsyncProviders(options), clientProvider],
      exports: [...this.createAsyncProviders(options), clientProvider],
    };
  }

  static registerAsync(options: OSModuleAsyncOptions): DynamicModule {
    return OSModule.forRootAsync(options);
  }

  private static createAsyncProviders(options: OSModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    if (options.useClass === undefined) {
      throw new Error('Options "useClass" is undefined');
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: OSModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: getOSModuleOptionsToken(),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    if (options.useClass === undefined) {
      throw new Error('Options "useClass" is undefined');
    }

    return {
      provide: getOSModuleOptionsToken(),
      useFactory: async (optionsFactory: OSModuleOptionsFactory): Promise<OSModuleOptions> =>
        await optionsFactory.createOSModuleOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
