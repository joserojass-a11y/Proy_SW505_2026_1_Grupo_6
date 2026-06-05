import { ValidationException } from '../exceptions/validation.exception';

/**
 * Value Object: NotificationEventStatus
 * Representa el ciclo de vida de un evento: pending, sent, failed
 */
export type NotificationEventStatusType = 'pending' | 'sent' | 'failed';

const VALID_STATUSES: NotificationEventStatusType[] = ['pending', 'sent', 'failed'];

export class NotificationEventStatus {
  private constructor(private readonly _value: NotificationEventStatusType) {}

  static create(value: string): NotificationEventStatus {
    const normalized = value.toLowerCase();

    if (!VALID_STATUSES.includes(normalized as NotificationEventStatusType)) {
      throw new ValidationException(
        `Invalid notification event status. Valid statuses: ${VALID_STATUSES.join(', ')}. Received: ${value}`,
        'INVALID_EVENT_STATUS'
      );
    }

    return new NotificationEventStatus(normalized as NotificationEventStatusType);
  }

  static pending(): NotificationEventStatus {
    return new NotificationEventStatus('pending');
  }

  static sent(): NotificationEventStatus {
    return new NotificationEventStatus('sent');
  }

  static failed(): NotificationEventStatus {
    return new NotificationEventStatus('failed');
  }

  get value(): NotificationEventStatusType {
    return this._value;
  }

  isPending(): boolean {
    return this._value === 'pending';
  }

  isSent(): boolean {
    return this._value === 'sent';
  }

  isFailed(): boolean {
    return this._value === 'failed';
  }

  equals(other: NotificationEventStatus): boolean {
    return this._value === other.value;
  }

  toString(): string {
    return this._value;
  }
}
