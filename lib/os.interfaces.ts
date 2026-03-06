import * as OSTypes from '@opensearch-project/opensearch';

export type { OSTypes };

export enum ConnectionMethod {
  Local = 'local',
  Proxy = 'proxy',
  ServiceAccount = 'serviceAccount',
  Credentials = 'credentials',
}

export interface Local {
  host: string;
  connectionMethod: ConnectionMethod.Local;
}

export interface Proxy {
  host: string;
  connectionMethod: ConnectionMethod.Proxy;
}

export interface ServiceAccount {
  host: string;
  connectionMethod: ConnectionMethod.ServiceAccount;
  region: string;
  credentials: {
    arn: string;
    tokenFile: string;
  };
}

export interface Credentials {
  host: string;
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

export interface OSModuleAsyncOptions {
  inject: any[];
  useFactory: (...args: any[]) => Promise<OSModuleOptions> | OSModuleOptions;
}
