import { ValidationException } from '../exceptions/validation.exception';

/**
 * Value Object: NotificationRecipientType
 * Representa el tipo de destinatario: cliente (customer) o usuario del sistema (user)
 */
export type NotificationRecipientTypeValue = 'customer' | 'user';

const VALID_TYPES: NotificationRecipientTypeValue[] = ['customer', 'user'];

export class NotificationRecipientType {
  private constructor(private readonly _value: NotificationRecipientTypeValue) {}

  static create(value: string): NotificationRecipientType {
    const normalized = value.toLowerCase();

    if (!VALID_TYPES.includes(normalized as NotificationRecipientTypeValue)) {
      throw new ValidationException(
        `Invalid recipient type. Valid types: ${VALID_TYPES.join(', ')}. Received: ${value}`,
        'INVALID_RECIPIENT_TYPE'
      );
    }

    return new NotificationRecipientType(normalized as NotificationRecipientTypeValue);
  }

  static customer(): NotificationRecipientType {
    return new NotificationRecipientType('customer');
  }

  static user(): NotificationRecipientType {
    return new NotificationRecipientType('user');
  }

  get value(): NotificationRecipientTypeValue {
    return this._value;
  }

  isCustomer(): boolean {
    return this._value === 'customer';
  }

  isUser(): boolean {
    return this._value === 'user';
  }

  equals(other: NotificationRecipientType): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
