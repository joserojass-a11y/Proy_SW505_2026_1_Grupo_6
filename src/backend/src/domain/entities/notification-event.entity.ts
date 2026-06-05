import { NotificationEventId } from '../value-objects/notification-event-id.vo';
import { NotificationChannelCode } from '../value-objects/notification-channel-code.vo';
import { NotificationRecipientType } from '../value-objects/notification-recipient-type.vo';
import { NotificationEventStatus } from '../value-objects/notification-event-status.vo';
import { UserId } from '../value-objects/user-id.vo';
import { TenantId } from '../value-objects/tenant-id.vo';
import { MaxRetriesExceededException } from '../exceptions/max-retries-exceeded.exception';

/**
 * Interfaz de propiedades primitivas para serialización/deserialización
 */
export interface NotificationEventPrimitives {
  id: string;
  tenantId: string;
  bookingId: string | null;
  templateId: string;
  channelCode: string;
  recipientType: 'customer' | 'user';
  recipientId: string;
  contactPoint: string;
  subject: string | null;
  renderedContent: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  scheduledFor: Date;
  sentAt: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaz para crear una nueva notificación
 */
export interface CreateNotificationEventProps {
  id?: NotificationEventId | string;
  tenantId: TenantId | string;
  bookingId?: string | null;
  templateId: string;
  channelCode: NotificationChannelCode | string;
  recipientType: NotificationRecipientType | 'customer' | 'user';
  recipientId: UserId | string;
  contactPoint: string;
  subject?: string | null;
  renderedContent: string;
  scheduledFor?: Date;
  maxRetries?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz para reconstitución desde BD
 */
export interface ReconstituteNotificationEventProps {
  id: NotificationEventId | string;
  tenantId: TenantId | string;
  bookingId: string | null;
  templateId: string;
  channelCode: NotificationChannelCode | string;
  recipientType: NotificationRecipientType | 'customer' | 'user';
  recipientId: UserId | string;
  contactPoint: string;
  subject: string | null;
  renderedContent: string;
  status: NotificationEventStatus | 'pending' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  scheduledFor: Date;
  sentAt: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad: NotificationEvent
 * 
 * Representa un trabajo de notificación en la cola de envíos.
 * Es la manifestación del patrón CQS: cada evento es un comando asíncrono
 * que debe procesarse y ejecutarse de forma confiable.
 * 
 * Responsabilidades:
 * - Mantener el estado del ciclo de vida de una notificación
 * - Facilitar reintentos con backoff exponencial
 * - Auditar fallos y éxitos
 * - Almacenar metadatos para trazabilidad
 */
export class NotificationEvent {
  private constructor(
    private _id: NotificationEventId,
    private _tenantId: TenantId,
    private _bookingId: string | null,
    private _templateId: string,
    private _channelCode: NotificationChannelCode,
    private _recipientType: NotificationRecipientType,
    private _recipientId: UserId,
    private _contactPoint: string,
    private _subject: string | null,
    private _renderedContent: string,
    private _status: NotificationEventStatus,
    private _retryCount: number,
    private _maxRetries: number,
    private _lastError: string | null,
    private _scheduledFor: Date,
    private _sentAt: Date | null,
    private _metadata: Record<string, any>,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Factory method: Crear un nuevo evento de notificación
   */
  static create(props: CreateNotificationEventProps): NotificationEvent {
    const now = new Date();
    const scheduledFor = props.scheduledFor || now;

    return new NotificationEvent(
      NotificationEvent.toId(props.id),
      NotificationEvent.toTenantId(props.tenantId),
      props.bookingId ?? null,
      props.templateId,
      NotificationEvent.toChannelCode(props.channelCode),
      NotificationEvent.toRecipientType(props.recipientType),
      NotificationEvent.toRecipientId(props.recipientId),
      props.contactPoint,
      props.subject ?? null,
      props.renderedContent,
      NotificationEventStatus.pending(),
      0,
      props.maxRetries ?? 3,
      null,
      scheduledFor,
      null,
      props.metadata ?? {},
      props.createdAt || now,
      props.updatedAt || now,
    );
  }

  /**
   * Factory method: Reconstitución desde persistencia
   */
  static reconstitute(props: ReconstituteNotificationEventProps): NotificationEvent {
    return new NotificationEvent(
      NotificationEvent.toId(props.id),
      NotificationEvent.toTenantId(props.tenantId),
      props.bookingId,
      props.templateId,
      NotificationEvent.toChannelCode(props.channelCode),
      NotificationEvent.toRecipientType(props.recipientType),
      NotificationEvent.toRecipientId(props.recipientId),
      props.contactPoint,
      props.subject,
      props.renderedContent,
      NotificationEvent.toStatus(props.status),
      props.retryCount,
      props.maxRetries,
      props.lastError,
      props.scheduledFor,
      props.sentAt,
      props.metadata,
      props.createdAt,
      props.updatedAt,
    );
  }

  /**
   * Método: Marcar como enviado exitosamente
   */
  markAsSent(): void {
    if (!this._status.isPending()) {
      throw new Error(`Cannot mark as sent: current status is ${this._status.value}`);
    }
    this._status = NotificationEventStatus.sent();
    this._sentAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Método: Registrar fallo y preparar para reintento
   * @throws MaxRetriesExceededException si ya se agotaron los reintentos
   */
  recordFailure(error: string): void {
    if (this._retryCount >= this._maxRetries) {
      throw new MaxRetriesExceededException(
        this._id.value,
        this._retryCount,
        this._maxRetries
      );
    }

    this._retryCount++;
    this._lastError = error;
    this._status = NotificationEventStatus.failed();
    this._updatedAt = new Date();
  }

  /**
   * Método: Resetear el status a pending para reintento
   */
  resetForRetry(): void {
    this._status = NotificationEventStatus.pending();
    this._updatedAt = new Date();
  }

  /**
   * Método: Calcular backoff exponencial para próximo reintento
   * Fórmula: 2^retryCount * 1000ms (1s, 2s, 4s, 8s...)
   */
  getNextRetryDelay(): number {
    return Math.pow(2, this._retryCount) * 1000;
  }

  /**
   * Método: Convertir a primitivas para persistencia
   */
  toPrimitives(): NotificationEventPrimitives {
    return {
      id: this._id.value,
      tenantId: this._tenantId.value,
      bookingId: this._bookingId,
      templateId: this._templateId,
      channelCode: this._channelCode.value,
      recipientType: this._recipientType.value,
      recipientId: this._recipientId.value,
      contactPoint: this._contactPoint,
      subject: this._subject,
      renderedContent: this._renderedContent,
      status: this._status.value,
      retryCount: this._retryCount,
      maxRetries: this._maxRetries,
      lastError: this._lastError,
      scheduledFor: this._scheduledFor,
      sentAt: this._sentAt,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ============ Getters ============

  get id(): NotificationEventId {
    return this._id;
  }

  get tenantId(): TenantId {
    return this._tenantId;
  }

  get bookingId(): string | null {
    return this._bookingId;
  }

  get templateId(): string {
    return this._templateId;
  }

  get channelCode(): NotificationChannelCode {
    return this._channelCode;
  }

  get recipientType(): NotificationRecipientType {
    return this._recipientType;
  }

  get recipientId(): UserId {
    return this._recipientId;
  }

  get contactPoint(): string {
    return this._contactPoint;
  }

  get subject(): string | null {
    return this._subject;
  }

  get renderedContent(): string {
    return this._renderedContent;
  }

  get status(): NotificationEventStatus {
    return this._status;
  }

  get retryCount(): number {
    return this._retryCount;
  }

  get maxRetries(): number {
    return this._maxRetries;
  }

  get lastError(): string | null {
    return this._lastError;
  }

  get scheduledFor(): Date {
    return this._scheduledFor;
  }

  get sentAt(): Date | null {
    return this._sentAt;
  }

  get metadata(): Record<string, any> {
    return this._metadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ============ Conversiones de tipos privadas ============

  private static toId(value?: string | NotificationEventId): NotificationEventId {
    if (value instanceof NotificationEventId) return value;
    if (typeof value === 'string') return NotificationEventId.create(value);
    // Auto-generar UUID v4 cuando no se provee ID (caso create())
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return NotificationEventId.create(uuid);
  }

  private static toTenantId(value: string | TenantId): TenantId {
    if (value instanceof TenantId) return value;
    if (typeof value === 'string') return TenantId.create(value);
    throw new Error('Invalid TenantId');
  }

  private static toChannelCode(value: string | NotificationChannelCode): NotificationChannelCode {
    if (value instanceof NotificationChannelCode) return value;
    if (typeof value === 'string') return NotificationChannelCode.create(value);
    throw new Error('Invalid NotificationChannelCode');
  }

  private static toRecipientType(
    value: string | NotificationRecipientType
  ): NotificationRecipientType {
    if (value instanceof NotificationRecipientType) return value;
    if (typeof value === 'string') return NotificationRecipientType.create(value);
    throw new Error('Invalid NotificationRecipientType');
  }

  private static toRecipientId(value: string | UserId): UserId {
    if (value instanceof UserId) return value;
    if (typeof value === 'string') return UserId.create(value);
    throw new Error('Invalid UserId');
  }

  private static toStatus(value: string | NotificationEventStatus): NotificationEventStatus {
    if (value instanceof NotificationEventStatus) return value;
    if (typeof value === 'string') return NotificationEventStatus.create(value);
    throw new Error('Invalid NotificationEventStatus');
  }
}
