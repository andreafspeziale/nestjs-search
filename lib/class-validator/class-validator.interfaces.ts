import { ConnectionMethod } from '../os.interfaces';

export interface IOSLocalSchema {
  OS_HOST: string;
  OS_CONNECTION_METHOD: ConnectionMethod.Local;
}

export interface IOSProxySchema {
  OS_HOST: string;
  OS_CONNECTION_METHOD: ConnectionMethod.Proxy;
}

export interface IOSServiceAccountSchema {
  OS_HOST: string;
  OS_CONNECTION_METHOD: ConnectionMethod.ServiceAccount;
  AWS_REGION: string;
  AWS_ROLE_ARN: string;
  AWS_WEB_IDENTITY_TOKEN_FILE: string;
}

export interface IOSCredentialsSchema {
  OS_HOST: string;
  OS_CONNECTION_METHOD: ConnectionMethod.Credentials;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
}

export interface IOSSchema {
  OS_HOST: string;
  OS_CONNECTION_METHOD: ConnectionMethod;
  AWS_REGION?: string;
  AWS_ROLE_ARN?: string;
  AWS_WEB_IDENTITY_TOKEN_FILE?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}
