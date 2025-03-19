import { z } from 'zod';
import { ConnectionMethod } from '../os.interfaces';
import { OS_HOST, OS_PROXY_HOST } from '../os.defaults';
import { OS_CONFIG_DISCRIMINATOR } from '../os.constants';

export const buildOSSchemas = (defaults?: {
  OS_LOCAL_HOST?: string;
  OS_PROXY_HOST?: string;
  OS_SA_HOST?: string;
  OS_SA_REGION?: string;
  OS_CREDENTIAL_HOST?: string;
  OS_CREDENTIAL_REGION?: string;
}) => {
  const schemas = {
    osLocalSchema: z.object({
      OS_HOST: defaults?.OS_LOCAL_HOST
        ? z.string().url().default(defaults.OS_LOCAL_HOST)
        : z.string().url().default(OS_HOST),
      OS_CONNECTION_METHOD: z.literal(ConnectionMethod.Local),
    }),
    osProxySchema: z.object({
      OS_HOST: defaults?.OS_PROXY_HOST
        ? z.string().url().default(defaults.OS_PROXY_HOST)
        : z.string().url().default(OS_PROXY_HOST),
      OS_CONNECTION_METHOD: z.literal(ConnectionMethod.Proxy),
    }),
    osServiceAccountSchema: z.object({
      OS_HOST: defaults?.OS_SA_HOST
        ? z.string().url().default(defaults.OS_SA_HOST)
        : z.string().url(),
      OS_CONNECTION_METHOD: z.literal(ConnectionMethod.ServiceAccount),
      AWS_REGION: defaults?.OS_SA_REGION ? z.string().default(defaults.OS_SA_REGION) : z.string(),
      AWS_ROLE_ARN: z.string(),
      AWS_WEB_IDENTITY_TOKEN_FILE: z.string(),
    }),
    osCredentialsSchema: z.object({
      OS_HOST: defaults?.OS_CREDENTIAL_HOST
        ? z.string().url().default(defaults.OS_CREDENTIAL_HOST)
        : z.string().url(),
      OS_CONNECTION_METHOD: z.literal(ConnectionMethod.Credentials),
      AWS_REGION: defaults?.OS_CREDENTIAL_REGION
        ? z.string().default(defaults.OS_CREDENTIAL_REGION)
        : z.string(),
      AWS_ACCESS_KEY_ID: z.string(),
      AWS_SECRET_ACCESS_KEY: z.string(),
    }),
  };

  return {
    ...schemas,
    osSchema: z.discriminatedUnion(OS_CONFIG_DISCRIMINATOR, [
      schemas.osLocalSchema,
      schemas.osProxySchema,
      schemas.osServiceAccountSchema,
      schemas.osCredentialsSchema,
    ]),
  };
};
