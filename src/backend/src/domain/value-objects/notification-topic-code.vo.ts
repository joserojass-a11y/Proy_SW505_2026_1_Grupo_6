import { ValidationException } from '../exceptions/validation.exception';

/**
 * Value Object: NotificationTopicCode
 * Representa el código técnico de un tópico (booking_confirmed, booking_cancelled, etc.)
 * Validación: Predefinido a eventos específicos del dominio
 */
export type NotificationTopicCodeType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'reminder_24h'
  | 'reminder_1h';

const VALID_TOPIC_CODES: NotificationTopicCodeType[] = [
  'booking_confirmed',
  'booking_cancelled',
  'booking_rescheduled',
  'reminder_24h',
  'reminder_1h'
];

export class NotificationTopicCode {
  private constructor(private readonly _value: NotificationTopicCodeType) {}

  static create(value: string): NotificationTopicCode {
    const normalized = value.toLowerCase();

    if (!VALID_TOPIC_CODES.includes(normalized as NotificationTopicCodeType)) {
      throw new ValidationException(
        `Invalid topic code. Valid codes: ${VALID_TOPIC_CODES.join(', ')}. Received: ${value}`,
        'INVALID_TOPIC_CODE'
      );
    }

    return new NotificationTopicCode(normalized as NotificationTopicCodeType);
  }

  get value(): NotificationTopicCodeType {
    return this._value;
  }

  equals(other: NotificationTopicCode): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
