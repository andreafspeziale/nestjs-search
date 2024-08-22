import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ConnectionMethod } from '../os.interfaces';
import { CREDENTIALS_CONNECTION_PROPS, SERVICE_ACCOUNT_CONNECTION_PROPS } from '../os.constants';
import type { IOSSchema } from './class-validator.interfaces';

@ValidatorConstraint({ name: 'IsOSConnectionInfoComplete', async: false })
export class IsOSConnectionInfoComplete implements ValidatorConstraintInterface {
  validate(prop: unknown, args: ValidationArguments): boolean {
    const o = args.object as IOSSchema;

    if (
      (o.OS_CONNECTION_METHOD === ConnectionMethod.ServiceAccount &&
        SERVICE_ACCOUNT_CONNECTION_PROPS.includes(
          args.property as (typeof SERVICE_ACCOUNT_CONNECTION_PROPS)[number],
        )) ||
      (o.OS_CONNECTION_METHOD === ConnectionMethod.Credentials &&
        CREDENTIALS_CONNECTION_PROPS.includes(
          args.property as (typeof CREDENTIALS_CONNECTION_PROPS)[number],
        ))
    ) {
      return prop && prop !== '' ? true : false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const o = args.object as IOSSchema;
    return `OpenSearch ${o.OS_CONNECTION_METHOD} connection method not completed, please check ${args.property}`;
  }
}
