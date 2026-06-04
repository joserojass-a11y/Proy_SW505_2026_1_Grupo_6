import { InvalidTimeSlotException } from '../exceptions/invalid-time-slot.exception';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class TimeSlot {
  private constructor(
    private readonly _startTime: string,
    private readonly _endTime: string
  ) {}

  static create(startTime: string, endTime: string): TimeSlot {
    const normalizedStart = TimeSlot.normalizeTime(startTime);
    const normalizedEnd = TimeSlot.normalizeTime(endTime);

    if (!TIME_REGEX.test(normalizedStart)) {
      throw new InvalidTimeSlotException(`Invalid start time format: ${startTime}. Must be HH:MM`);
    }
    if (!TIME_REGEX.test(normalizedEnd)) {
      throw new InvalidTimeSlotException(`Invalid end time format: ${endTime}. Must be HH:MM`);
    }

    const startMinutes = TimeSlot.toMinutes(normalizedStart);
    const endMinutes = TimeSlot.toMinutes(normalizedEnd);

    if (startMinutes >= endMinutes) {
      throw new InvalidTimeSlotException(
        `Start time (${normalizedStart}) must be before End time (${normalizedEnd})`
      );
    }

    return new TimeSlot(normalizedStart, normalizedEnd);
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get durationInMinutes(): number {
    return TimeSlot.toMinutes(this._endTime) - TimeSlot.toMinutes(this._startTime);
  }

  overlaps(other: TimeSlot): boolean {
    const thisStart = TimeSlot.toMinutes(this._startTime);
    const thisEnd = TimeSlot.toMinutes(this._endTime);
    const otherStart = TimeSlot.toMinutes(other._startTime);
    const otherEnd = TimeSlot.toMinutes(other._endTime);

    return thisStart < otherEnd && otherStart < thisEnd;
  }

  equals(other: TimeSlot): boolean {
    return this._startTime === other._startTime && this._endTime === other._endTime;
  }

  private static normalizeTime(time: string): string {
    const trimmed = time.trim();
    if (trimmed.length > 5 && trimmed.includes(':')) {
      const parts = trimmed.split(':');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
    }
    return trimmed.padStart(5, '0');
  }

  private static toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
