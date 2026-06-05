import { ValidationException } from '../exceptions/validation.exception';

/**
 * Value Object: NotificationRecipientRole
 * Representa el rol del destinatario: cliente, administrador, personal
 */
export type NotificationRecipientRoleType = 'customer' | 'admin' | 'staff';

const VALID_ROLES: NotificationRecipientRoleType[] = ['customer', 'admin', 'staff'];

export class NotificationRecipientRole {
  private constructor(private readonly _value: NotificationRecipientRoleType) {}

  static create(value: string): NotificationRecipientRole {
    const normalized = value.toLowerCase();

    if (!VALID_ROLES.includes(normalized as NotificationRecipientRoleType)) {
      throw new ValidationException(
        `Invalid recipient role. Valid roles: ${VALID_ROLES.join(', ')}. Received: ${value}`,
        'INVALID_RECIPIENT_ROLE'
      );
    }

    return new NotificationRecipientRole(normalized as NotificationRecipientRoleType);
  }

  get value(): NotificationRecipientRoleType {
    return this._value;
  }

  equals(other: NotificationRecipientRole): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }

  isCustomer(): boolean {
    return this._value === 'customer';
  }

  isAdmin(): boolean {
    return this._value === 'admin';
  }

  isStaff(): boolean {
    return this._value === 'staff';
  }
}
