import { IsEnum, IsNotEmpty, Validate, IsString, IsIn } from 'class-validator';
import { OS_HOST, OS_PROXY_HOST } from '../os.defaults';
import { ConnectionMethod } from '../os.interfaces';
import { IsOSConnectionInfoComplete } from './class-validator.validator';
import {
  IOSCredentialsSchema,
  IOSLocalSchema,
  IOSProxySchema,
  IOSSchema,
  IOSServiceAccountSchema,
} from './class-validator.interfaces';

export class OSLocalSchema implements IOSLocalSchema {
  @IsNotEmpty()
  @IsString()
  OS_HOST: string = OS_HOST;

  @IsIn([ConnectionMethod.Local])
  OS_CONNECTION_METHOD!: ConnectionMethod.Local;
}

export class OSProxySchema implements IOSProxySchema {
  @IsNotEmpty()
  @IsString()
  OS_HOST: string = OS_PROXY_HOST;

  @IsIn([ConnectionMethod.Proxy])
  OS_CONNECTION_METHOD!: ConnectionMethod.Proxy;
}

export class OSServiceAccountSchema implements IOSServiceAccountSchema {
  @IsNotEmpty()
  @IsString()
  OS_HOST!: string;

  @IsIn([ConnectionMethod.ServiceAccount])
  OS_CONNECTION_METHOD!: ConnectionMethod.ServiceAccount;

  @IsNotEmpty()
  @IsString()
  AWS_REGION!: string;

  @IsNotEmpty()
  @IsString()
  AWS_ROLE_ARN!: string;

  @IsNotEmpty()
  @IsString()
  AWS_WEB_IDENTITY_TOKEN_FILE!: string;
}

export class OSCredentialsSchema implements IOSCredentialsSchema {
  @IsNotEmpty()
  @IsString()
  OS_HOST!: string;

  @IsIn([ConnectionMethod.Credentials])
  OS_CONNECTION_METHOD!: ConnectionMethod.Credentials;

  @IsNotEmpty()
  @IsString()
  AWS_REGION!: string;

  @IsNotEmpty()
  @IsString()
  AWS_ACCESS_KEY_ID!: string;

  @IsNotEmpty()
  @IsString()
  AWS_SECRET_ACCESS_KEY!: string;
}

export class OSSChema implements IOSSchema {
  @IsNotEmpty()
  @IsString()
  OS_HOST!: string;

  @IsEnum(ConnectionMethod)
  OS_CONNECTION_METHOD!: ConnectionMethod;

  @Validate(IsOSConnectionInfoComplete)
  AWS_REGION?: string;

  @Validate(IsOSConnectionInfoComplete)
  AWS_ROLE_ARN?: string;

  @Validate(IsOSConnectionInfoComplete)
  AWS_WEB_IDENTITY_TOKEN_FILE?: string;

  @Validate(IsOSConnectionInfoComplete)
  AWS_ACCESS_KEY_ID?: string;

  @Validate(IsOSConnectionInfoComplete)
  AWS_SECRET_ACCESS_KEY?: string;
}
