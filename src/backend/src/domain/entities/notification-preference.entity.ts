import { CustomerId } from '../value-objects/customer-id.vo';
import { DuplicateNotificationPreferenceException } from '../exceptions/duplicate-notification-preference.exception';

/**
 * Interfaz de propiedades primitivas para serialización
 */
export interface NotificationPreferencePrimitives {
  id: string;
  customerId: string;
  topicId: string;
  channelId: string;
  isEnabled: boolean;
  frequency: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaz para crear una preferencia de notificación
 */
export interface CreateNotificationPreferenceProps {
  id?: string;
  customerId: CustomerId | string;
  topicId: string;
  channelId: string;
  isEnabled?: boolean;
  frequency?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz para reconstitución desde BD
 */
export interface ReconstituteNotificationPreferenceProps {
  id: string;
  customerId: CustomerId | string;
  topicId: string;
  channelId: string;
  isEnabled: boolean;
  frequency: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad: NotificationPreference
 * 
 * Representa la preferencia de un cliente sobre notificaciones.
 * Encapsula la lógica de opt-in/opt-out y frecuencia de envíos.
 * 
 * Responsabilidades:
 * - Almacenar preferencias por tópico y canal
 * - Permitir que clientes controlen qué reciben
 * - Respetar notificaciones mandatorias (nunca se pueden deshabilitar)
 */
export class NotificationPreference {
  private constructor(
    private _id: string,
    private _customerId: CustomerId,
    private _topicId: string,
    private _channelId: string,
    private _isEnabled: boolean,
    private _frequency: string,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Factory method: Crear preferencia nueva
   */
  static create(props: CreateNotificationPreferenceProps): NotificationPreference {
    const now = new Date();

    return new NotificationPreference(
      props.id || this.generateId(),
      NotificationPreference.toCustomerId(props.customerId),
      props.topicId,
      props.channelId,
      props.isEnabled ?? true,
      props.frequency ?? 'immediately',
      props.createdAt || now,
      props.updatedAt || now,
    );
  }

  /**
   * Factory method: Reconstitución desde persistencia
   */
  static reconstitute(props: ReconstituteNotificationPreferenceProps): NotificationPreference {
    return new NotificationPreference(
      props.id,
      NotificationPreference.toCustomerId(props.customerId),
      props.topicId,
      props.channelId,
      props.isEnabled,
      props.frequency,
      props.createdAt,
      props.updatedAt,
    );
  }

  /**
   * Método: Cambiar habilitación de la preferencia
   * @param isEnabled true para habilitar, false para deshabilitar
   */
  setEnabled(isEnabled: boolean): void {
    this._isEnabled = isEnabled;
    this._updatedAt = new Date();
  }

  /**
   * Método: Cambiar frecuencia de notificaciones
   */
  setFrequency(frequency: string): void {
    if (!this.isValidFrequency(frequency)) {
      throw new Error(`Invalid frequency: ${frequency}. Valid values: immediately, daily, weekly`);
    }
    this._frequency = frequency;
    this._updatedAt = new Date();
  }

  /**
   * Método: Validar si una frecuencia es válida
   */
  private isValidFrequency(frequency: string): boolean {
    return ['immediately', 'daily', 'weekly'].includes(frequency);
  }

  /**
   * Método: Convertir a primitivas para persistencia
   */
  toPrimitives(): NotificationPreferencePrimitives {
    return {
      id: this._id,
      customerId: this._customerId.value,
      topicId: this._topicId,
      channelId: this._channelId,
      isEnabled: this._isEnabled,
      frequency: this._frequency,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ============ Getters ============

  get id(): string {
    return this._id;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get topicId(): string {
    return this._topicId;
  }

  get channelId(): string {
    return this._channelId;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  get frequency(): string {
    return this._frequency;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ============ Privadas ============

  private static toCustomerId(value: string | CustomerId): CustomerId {
    if (value instanceof CustomerId) return value;
    if (typeof value === 'string') return CustomerId.create(value);
    throw new Error('Invalid CustomerId');
  }

  private static generateId(): string {
    // Generar UUID v4 simple
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
