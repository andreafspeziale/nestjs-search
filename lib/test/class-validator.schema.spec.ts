import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  OSCredentialsSchema,
  OSLocalSchema,
  OSProxySchema,
  OSSchema,
  OSServiceAccountSchema,
} from '../class-validator';
import { ConnectionMethod } from '../os.interfaces';
import { OS_HOST } from '../os.defaults';
import { CREDENTIALS_CONNECTION_PROPS, SERVICE_ACCOUNT_CONNECTION_PROPS } from '../os.constants';

describe('OSLocalSchema (spec)', () => {
  [
    {
      description: `Should fail if OS_CONNECTION_METHOD is different than "${ConnectionMethod.Local}"`,
      scenarios: [
        {
          env: { OS_CONNECTION_METHOD: 'whatever' },
          expected: [
            {
              property: 'OS_CONNECTION_METHOD',
              constraints: {
                isIn: `OS_CONNECTION_METHOD must be one of the following values: ${ConnectionMethod.Local}`,
              },
            },
          ],
        },
      ],
    },
  ].forEach(({ description, scenarios }) =>
    scenarios.forEach(({ env, expected }) =>
      it(`${description}`, () => {
        const envSchemaInstance = plainToInstance(OSLocalSchema, env);

        const errors = validateSync(envSchemaInstance);

        errors.forEach((e, i) => {
          expect(e.property).toBe(expected[i]?.property);
          expect(e.constraints).toEqual(expected[i]?.constraints);
        });
      }),
    ),
  );
});

describe('OSProxySchema', () => {
  [
    {
      description: `Should fail if OS_CONNECTION_METHOD is different than "${ConnectionMethod.Proxy}"`,
      scenarios: [
        {
          env: { OS_CONNECTION_METHOD: 'whatever' },
          expected: [
            {
              property: 'OS_CONNECTION_METHOD',
              constraints: {
                isIn: `OS_CONNECTION_METHOD must be one of the following values: ${ConnectionMethod.Proxy}`,
              },
            },
          ],
        },
      ],
    },
  ].forEach(({ description, scenarios }) =>
    scenarios.forEach(({ env, expected }) =>
      it(`${description}`, () => {
        const envSchemaInstance = plainToInstance(OSProxySchema, env);

        const errors = validateSync(envSchemaInstance);

        errors.forEach((e, i) => {
          expect(e.property).toBe(expected[i]?.property);
          expect(e.constraints).toEqual(expected[i]?.constraints);
        });
      }),
    ),
  );
});

describe('OSServiceAccountSchema', () => {
  [
    {
      description: `Should fail if OS_CONNECTION_METHOD is different than "${ConnectionMethod.ServiceAccount}" and props are missing`,
      scenarios: [
        {
          env: { OS_CONNECTION_METHOD: 'whatever' },
          expected: [
            {
              property: 'OS_HOST',
              constraints: {
                isString: 'OS_HOST must be a string',
                isNotEmpty: 'OS_HOST should not be empty',
              },
            },
            {
              property: 'OS_CONNECTION_METHOD',
              constraints: {
                isIn: `OS_CONNECTION_METHOD must be one of the following values: ${ConnectionMethod.ServiceAccount}`,
              },
            },
            {
              property: 'AWS_REGION',
              constraints: {
                isString: 'AWS_REGION must be a string',
                isNotEmpty: 'AWS_REGION should not be empty',
              },
            },
            {
              property: 'AWS_ROLE_ARN',
              constraints: {
                isString: 'AWS_ROLE_ARN must be a string',
                isNotEmpty: 'AWS_ROLE_ARN should not be empty',
              },
            },
            {
              property: 'AWS_WEB_IDENTITY_TOKEN_FILE',
              constraints: {
                isString: 'AWS_WEB_IDENTITY_TOKEN_FILE must be a string',
                isNotEmpty: 'AWS_WEB_IDENTITY_TOKEN_FILE should not be empty',
              },
            },
          ],
        },
      ],
    },
    {
      description: `Should fail if props are empty strings`,
      scenarios: [
        {
          env: {
            OS_HOST: '',
            OS_CONNECTION_METHOD: ConnectionMethod.ServiceAccount,
            AWS_REGION: '',
            AWS_ROLE_ARN: '',
            AWS_WEB_IDENTITY_TOKEN_FILE: '',
          },
          expected: [
            {
              property: 'OS_HOST',
              constraints: {
                isNotEmpty: 'OS_HOST should not be empty',
              },
            },
            {
              property: 'AWS_REGION',
              constraints: {
                isNotEmpty: 'AWS_REGION should not be empty',
              },
            },
            {
              property: 'AWS_ROLE_ARN',
              constraints: {
                isNotEmpty: 'AWS_ROLE_ARN should not be empty',
              },
            },
            {
              property: 'AWS_WEB_IDENTITY_TOKEN_FILE',
              constraints: {
                isNotEmpty: 'AWS_WEB_IDENTITY_TOKEN_FILE should not be empty',
              },
            },
          ],
        },
      ],
    },
  ].forEach(({ description, scenarios }) =>
    scenarios.forEach(({ env, expected }) =>
      it(`${description}`, () => {
        const envSchemaInstance = plainToInstance(OSServiceAccountSchema, env);

        const errors = validateSync(envSchemaInstance);

        errors.forEach((e, i) => {
          expect(e.property).toBe(expected[i]?.property);
          expect(e.constraints).toEqual(expected[i]?.constraints);
        });
      }),
    ),
  );
});

describe('OSCredentialsSchema', () => {
  [
    {
      description: `Should fail if OS_CONNECTION_METHOD is different than "${ConnectionMethod.Credentials}" and props are missing`,
      scenarios: [
        {
          env: { OS_CONNECTION_METHOD: 'whatever' },
          expected: [
            {
              property: 'OS_HOST',
              constraints: {
                isString: 'OS_HOST must be a string',
                isNotEmpty: 'OS_HOST should not be empty',
              },
            },
            {
              property: 'OS_CONNECTION_METHOD',
              constraints: {
                isIn: `OS_CONNECTION_METHOD must be one of the following values: ${ConnectionMethod.Credentials}`,
              },
            },
            {
              property: 'AWS_REGION',
              constraints: {
                isString: 'AWS_REGION must be a string',
                isNotEmpty: 'AWS_REGION should not be empty',
              },
            },
            {
              property: 'AWS_ACCESS_KEY_ID',
              constraints: {
                isString: 'AWS_ACCESS_KEY_ID must be a string',
                isNotEmpty: 'AWS_ACCESS_KEY_ID should not be empty',
              },
            },
            {
              property: 'AWS_SECRET_ACCESS_KEY',
              constraints: {
                isString: 'AWS_SECRET_ACCESS_KEY must be a string',
                isNotEmpty: 'AWS_SECRET_ACCESS_KEY should not be empty',
              },
            },
          ],
        },
      ],
    },
    {
      description: `Should fail if props are empty strings`,
      scenarios: [
        {
          env: {
            OS_HOST: '',
            OS_CONNECTION_METHOD: ConnectionMethod.Credentials,
            AWS_REGION: '',
            AWS_ACCESS_KEY_ID: '',
            AWS_SECRET_ACCESS_KEY: '',
          },
          expected: [
            {
              property: 'OS_HOST',
              constraints: {
                isNotEmpty: 'OS_HOST should not be empty',
              },
            },
            {
              property: 'AWS_REGION',
              constraints: {
                isNotEmpty: 'AWS_REGION should not be empty',
              },
            },
            {
              property: 'AWS_ACCESS_KEY_ID',
              constraints: {
                isNotEmpty: 'AWS_ACCESS_KEY_ID should not be empty',
              },
            },
            {
              property: 'AWS_SECRET_ACCESS_KEY',
              constraints: {
                isNotEmpty: 'AWS_SECRET_ACCESS_KEY should not be empty',
              },
            },
          ],
        },
      ],
    },
  ].forEach(({ description, scenarios }) =>
    scenarios.forEach(({ env, expected }) =>
      it(`${description}`, () => {
        const envSchemaInstance = plainToInstance(OSCredentialsSchema, env);

        const errors = validateSync(envSchemaInstance);

        errors.forEach((e, i) => {
          expect(e.property).toBe(expected[i]?.property);
          expect(e.constraints).toEqual(expected[i]?.constraints);
        });
      }),
    ),
  );
});

describe('OSSchema', () => {
  [
    {
      description: 'Should fail if OS_HOST is set',
      scenarios: [
        {
          env: { OS_CONNECTION_METHOD: ConnectionMethod.Local },
          expected: [
            {
              property: 'OS_HOST',
              constraints: {
                isString: 'OS_HOST must be a string',
                isNotEmpty: 'OS_HOST should not be empty',
              },
            },
          ],
        },
      ],
    },
    {
      description: 'Should fail if OS_HOST is set',
      scenarios: [
        {
          env: { OS_HOST: '', OS_CONNECTION_METHOD: ConnectionMethod.Local },
          expected: [
            {
              property: 'OS_HOST',
              constraints: {
                isNotEmpty: 'OS_HOST should not be empty',
              },
            },
          ],
        },
      ],
    },
    {
      description: 'Should fail if OS_CONNECTION_METHOD is something not mapped',
      scenarios: [
        {
          env: { OS_HOST: OS_HOST, OS_CONNECTION_METHOD: 'whatever' },
          expected: [
            {
              property: 'OS_CONNECTION_METHOD',
              constraints: {
                isEnum:
                  'OS_CONNECTION_METHOD must be one of the following values: local, proxy, serviceAccount, credentials',
              },
            },
          ],
        },
      ],
    },
    {
      description: `Should fail if OS_CONNECTION_METHOD ${ConnectionMethod.ServiceAccount} is not complete`,
      scenarios: [
        {
          env: { OS_HOST: OS_HOST, OS_CONNECTION_METHOD: ConnectionMethod.ServiceAccount },
          expected: [
            {
              property: SERVICE_ACCOUNT_CONNECTION_PROPS[0],
              constraints: {
                IsOSConnectionInfoComplete: `OpenSearch ${ConnectionMethod.ServiceAccount} connection method not completed, please check ${SERVICE_ACCOUNT_CONNECTION_PROPS[0]}`,
              },
            },
            {
              property: SERVICE_ACCOUNT_CONNECTION_PROPS[1],
              constraints: {
                IsOSConnectionInfoComplete: `OpenSearch ${ConnectionMethod.ServiceAccount} connection method not completed, please check ${SERVICE_ACCOUNT_CONNECTION_PROPS[1]}`,
              },
            },
            {
              property: SERVICE_ACCOUNT_CONNECTION_PROPS[2],
              constraints: {
                IsOSConnectionInfoComplete: `OpenSearch ${ConnectionMethod.ServiceAccount} connection method not completed, please check ${SERVICE_ACCOUNT_CONNECTION_PROPS[2]}`,
              },
            },
          ],
        },
      ],
    },
    {
      description: `Should fail if OS_CONNECTION_METHOD ${ConnectionMethod.Credentials} is not complete`,
      scenarios: [
        {
          env: { OS_HOST: OS_HOST, OS_CONNECTION_METHOD: ConnectionMethod.Credentials },
          expected: [
            {
              property: CREDENTIALS_CONNECTION_PROPS[0],
              constraints: {
                IsOSConnectionInfoComplete: `OpenSearch ${ConnectionMethod.Credentials} connection method not completed, please check ${CREDENTIALS_CONNECTION_PROPS[0]}`,
              },
            },
            {
              property: CREDENTIALS_CONNECTION_PROPS[1],
              constraints: {
                IsOSConnectionInfoComplete: `OpenSearch ${ConnectionMethod.Credentials} connection method not completed, please check ${CREDENTIALS_CONNECTION_PROPS[1]}`,
              },
            },
            {
              property: CREDENTIALS_CONNECTION_PROPS[2],
              constraints: {
                IsOSConnectionInfoComplete: `OpenSearch ${ConnectionMethod.Credentials} connection method not completed, please check ${CREDENTIALS_CONNECTION_PROPS[2]}`,
              },
            },
          ],
        },
      ],
    },
  ].forEach(({ description, scenarios }) =>
    scenarios.forEach(({ env, expected }) =>
      it(`${description}`, () => {
        const envSchemaInstance = plainToInstance(OSSchema, env);

        const errors = validateSync(envSchemaInstance);

        errors.forEach((e, i) => {
          expect(e.property).toBe(expected[i]?.property);
          expect(e.constraints).toEqual(expected[i]?.constraints);
        });
      }),
    ),
  );
});
