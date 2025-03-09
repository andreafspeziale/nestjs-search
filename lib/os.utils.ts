import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { ConnectionMethod, OSModuleOptions } from './os.interfaces';
import { OS_CLIENT_TOKEN, OS_MODULE_OPTIONS_TOKEN } from './os.constants';

export const getOSModuleOptionsToken = (): string => OS_MODULE_OPTIONS_TOKEN;
export const getOSClientToken = (): string => OS_CLIENT_TOKEN;

export const createOSClient = (options: OSModuleOptions): Client => {
  if (options.connectionMethod === ConnectionMethod.ServiceAccount) {
    return new Client({
      ...AwsSigv4Signer({
        region: options.region,
        getCredentials: async () => {
          try {
            const { fromTokenFile } = await import('@aws-sdk/credential-providers');

            return fromTokenFile({
              roleArn: options.credentials.arn,
              webIdentityTokenFile: options.credentials.tokenFile,
            })();
          } catch (e) {
            throw new Error((e as Error).message);
          }
        },
      }),
      node: options.host,
    });
  }

  if (options.connectionMethod === ConnectionMethod.Credentials) {
    return new Client({
      ...AwsSigv4Signer({
        region: options.region,
        getCredentials: () =>
          Promise.resolve({
            accessKeyId: options.credentials.accessKeyId,
            secretAccessKey: options.credentials.secretAccessKey,
          }),
      }),
      node: options.host,
    });
  }

  if (
    options.connectionMethod === ConnectionMethod.Local ||
    options.connectionMethod === ConnectionMethod.Proxy
  ) {
    return new Client({
      node: options.host,
    });
  }

  throw new Error();
};
