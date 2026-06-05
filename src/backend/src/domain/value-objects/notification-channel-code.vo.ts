import { ValidationException } from '../exceptions/validation.exception';

/**
 * Value Object: NotificationChannelCode
 * Representa el código técnico de un canal (email, sms, push)
 * Validación: No vacío, máximo 50 caracteres, solo alfanuméricos + guión bajo
 */
export class NotificationChannelCode {
  private constructor(private readonly _value: string) {}

  static create(value: string): NotificationChannelCode {
    const normalized = value.trim().toLowerCase();

    if (!normalized || normalized.length === 0 || normalized.length > 50) {
      throw new ValidationException(
        `Invalid channel code: must be 1-50 characters. Received: ${value}`,
        'INVALID_CHANNEL_CODE'
      );
    }

    if (!/^[a-z0-9_]+$/.test(normalized)) {
      throw new ValidationException(
        `Invalid channel code: only lowercase letters, numbers, and underscores allowed. Received: ${value}`,
        'INVALID_CHANNEL_CODE_FORMAT'
      );
    }

    return new NotificationChannelCode(normalized);
  }

  get value(): string {
    return this._value;
  }

  equals(other: NotificationChannelCode): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
