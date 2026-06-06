import { ZoneId } from '../value-objects/zone-id.vo';

export interface ZonePrimitives {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateZoneProps {
  id?: ZoneId | string;
  name: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReconstituteZoneProps {
  id: ZoneId | string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Zone {
  private constructor(
    private _id: ZoneId,
    private _name: string,
    private _code: string,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(props: CreateZoneProps): Zone {
    return new Zone(
      Zone.toZoneId(props.id),
      Zone.normalizeName(props.name),
      Zone.normalizeCode(props.code),
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  static reconstitute(props: ReconstituteZoneProps): Zone {
    return new Zone(
      Zone.toZoneId(props.id),
      Zone.normalizeName(props.name),
      Zone.normalizeCode(props.code),
      props.createdAt,
      props.updatedAt,
    );
  }

  get id(): ZoneId { return this._id; }
  get name(): string { return this._name; }
  get code(): string { return this._code; }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }

  touch(date: Date = new Date()): void { this._updatedAt = date; }

  toPrimitives(): ZonePrimitives {
    return {
      id: this._id.value,
      name: this._name,
      code: this._code,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }

  private static toZoneId(value: ZoneId | string | undefined): ZoneId {
    if (!value) throw new Error('Zone id is required');
    return value instanceof ZoneId ? value : ZoneId.create(value);
  }

  private static normalizeName(value: string): string {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');
    if (normalizedValue.length < 2 || normalizedValue.length > 255) throw new Error('Zone name is invalid');
    return normalizedValue;
  }

  private static normalizeCode(value: string): string {
    const normalizedValue = value.trim().toUpperCase();
    if (normalizedValue.length < 2) throw new Error('Invalid zone code');
    return normalizedValue;
  }
}
