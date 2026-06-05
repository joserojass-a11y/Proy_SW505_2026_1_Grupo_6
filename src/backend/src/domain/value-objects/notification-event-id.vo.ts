import { ValidationException } from '../exceptions/validation.exception';

/**
 * Value Object: NotificationEventId
 * Identificador único para un evento de notificación (UUID)
 */
export class NotificationEventId {
  private constructor(private readonly _value: string) {}

  static create(value: string): NotificationEventId {
    if (!value || value.trim().length === 0) {
      throw new ValidationException(
        'Notification event ID cannot be empty',
        'INVALID_NOTIFICATION_EVENT_ID'
      );
    }

    // Validación básica de UUID v4 (36 caracteres con guiones)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      throw new ValidationException(
        `Invalid UUID format for notification event ID: ${value}`,
        'INVALID_NOTIFICATION_EVENT_ID_FORMAT'
      );
    }

    return new NotificationEventId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: NotificationEventId): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
