import { ModuleMetadata, Type } from '@nestjs/common';
import { Client, ClientOptions } from '@opensearch-project/opensearch';

export enum ConnectionMethod {
  Local = 'local',
  Proxy = 'proxy',
  ServiceAccount = 'serviceAccount',
  Credentials = 'credentials',
}

export interface Local {
  host: string;
  client: new (opts: ClientOptions) => Client;
  connectionMethod: ConnectionMethod.Local;
}

export interface Proxy {
  host: string;
  client: new (opts: ClientOptions) => Client;
  connectionMethod: ConnectionMethod.Proxy;
}

export interface ServiceAccount {
  host: string;
  client: new (opts: ClientOptions) => Client;
  connectionMethod: ConnectionMethod.ServiceAccount;
  region: string;
  credentials: {
    arn: string;
    tokenFile: string;
  };
}

export interface Credentials {
  host: string;
  client: new (opts: ClientOptions) => Client;
  connectionMethod: ConnectionMethod.Credentials;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export type OSModuleOptions<
  T extends Local | Proxy | ServiceAccount | Credentials =
    | Local
    | Proxy
    | ServiceAccount
    | Credentials,
> = T;

export interface OSConfig<
  T extends Local | Proxy | ServiceAccount | Credentials =
    | Local
    | Proxy
    | ServiceAccount
    | Credentials,
> {
  os: OSModuleOptions<T>;
}

export interface OSModuleOptionsFactory {
  createOSModuleOptions(): Promise<OSModuleOptions> | OSModuleOptions;
}

export interface OSModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<OSModuleOptionsFactory>;
  useExisting?: Type<OSModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<OSModuleOptions> | OSModuleOptions;
}
