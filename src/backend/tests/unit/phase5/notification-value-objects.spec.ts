import { NotificationChannelCode } from '../../../src/domain/value-objects/notification-channel-code.vo';
import { NotificationTopicCode } from '../../../src/domain/value-objects/notification-topic-code.vo';
import { NotificationRecipientRole } from '../../../src/domain/value-objects/notification-recipient-role.vo';
import { NotificationEventStatus } from '../../../src/domain/value-objects/notification-event-status.vo';
import { NotificationRecipientType } from '../../../src/domain/value-objects/notification-recipient-type.vo';
import { NotificationEventId } from '../../../src/domain/value-objects/notification-event-id.vo';

/**
 * Pruebas Unitarias: Value Objects de Notificaciones
 *
 * Cubre:
 * - NotificationChannelCode      → Código de canal (email, sms, push, etc.)
 * - NotificationTopicCode        → Código de tópico (booking_confirmed, reminder_24h, etc.)
 * - NotificationRecipientRole    → Rol del destinatario (customer, admin, staff)
 * - NotificationEventStatus      → Estado del evento (pending, sent, failed)
 * - NotificationRecipientType    → Tipo de destinatario (customer, user)
 * - NotificationEventId          → Identificador UUID v4 del evento
 *
 * Principio: cada VO auto-valida en su constructor y usa tipos discriminados.
 */
describe('Value Objects de Notificaciones — Capa de Dominio', () => {
  // ─────────────────────────────────────────────────────────────────────
  // 1. NotificationChannelCode
  // ─────────────────────────────────────────────────────────────────────
  describe('NotificationChannelCode', () => {
    it('debe crear un canal con un código alfanumérico válido', () => {
      const vo = NotificationChannelCode.create('email');
      expect(vo.value).toBe('email');
    });

    it('debe aceptar códigos de canal variados (sms, push)', () => {
      const sms = NotificationChannelCode.create('sms');
      const push = NotificationChannelCode.create('push');
      expect(sms.value).toBe('sms');
      expect(push.value).toBe('push');
    });

    it('debe lanzar excepción con un código vacío', () => {
      expect(() => NotificationChannelCode.create('')).toThrow();
    });

    it('debe lanzar excepción si el código excede 50 caracteres', () => {
      const longCode = 'a'.repeat(51);
      expect(() => NotificationChannelCode.create(longCode)).toThrow();
    });

    it('equals() debe retornar true para el mismo valor', () => {
      const a = NotificationChannelCode.create('email');
      const b = NotificationChannelCode.create('email');
      expect(a.equals(b)).toBe(true);
    });

    it('equals() debe retornar false para valores distintos', () => {
      const a = NotificationChannelCode.create('email');
      const b = NotificationChannelCode.create('sms');
      expect(a.equals(b)).toBe(false);
    });

    it('toString() debe retornar el valor primitivo', () => {
      const vo = NotificationChannelCode.create('email');
      expect(vo.toString()).toBe('email');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 2. NotificationTopicCode
  // ─────────────────────────────────────────────────────────────────────
  describe('NotificationTopicCode', () => {
    const validTopics = [
      'booking_confirmed',
      'booking_cancelled',
      'booking_rescheduled',
      'reminder_24h',
      'reminder_1h',
    ];

    it.each(validTopics)(
      'debe aceptar el tópico válido: %s',
      (topic) => {
        const vo = NotificationTopicCode.create(topic);
        expect(vo.value).toBe(topic);
      },
    );

    it('debe lanzar excepción para un tópico no permitido', () => {
      expect(() => NotificationTopicCode.create('INVALID_TOPIC')).toThrow();
    });

    it('debe retornar el valor correcto para booking_confirmed', () => {
      const a = NotificationTopicCode.create('booking_confirmed');
      const b = NotificationTopicCode.create('booking_confirmed');
      expect(a.value).toBe(b.value);
    });

    it('debe retornar valores distintos para tópicos diferentes', () => {
      const a = NotificationTopicCode.create('booking_confirmed');
      const b = NotificationTopicCode.create('booking_cancelled');
      expect(a.value).not.toBe(b.value);
    });

    it('toString() debe retornar el valor del tópico', () => {
      const vo = NotificationTopicCode.create('reminder_24h');
      expect(vo.toString()).toBe('reminder_24h');
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 3. NotificationRecipientRole
  // ─────────────────────────────────────────────────────────────────────
  describe('NotificationRecipientRole', () => {
    it('debe crear rol "customer" y responder correctamente a isCustomer()', () => {
      const vo = NotificationRecipientRole.create('customer');
      expect(vo.value).toBe('customer');
      expect(vo.isCustomer()).toBe(true);
      expect(vo.isAdmin()).toBe(false);
      expect(vo.isStaff()).toBe(false);
    });

    it('debe crear rol "admin" y responder correctamente a isAdmin()', () => {
      const vo = NotificationRecipientRole.create('admin');
      expect(vo.isAdmin()).toBe(true);
      expect(vo.isCustomer()).toBe(false);
    });

    it('debe crear rol "staff" y responder correctamente a isStaff()', () => {
      const vo = NotificationRecipientRole.create('staff');
      expect(vo.isStaff()).toBe(true);
      expect(vo.isCustomer()).toBe(false);
    });

    it('debe lanzar excepción para un rol inválido', () => {
      expect(() => NotificationRecipientRole.create('superuser')).toThrow();
    });

    it('debe comparar roles por valor correctamente', () => {
      const a = NotificationRecipientRole.create('admin');
      const b = NotificationRecipientRole.create('admin');
      const c = NotificationRecipientRole.create('staff');
      expect(a.value).toBe(b.value);
      expect(a.value).not.toBe(c.value);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 4. NotificationEventStatus
  // ─────────────────────────────────────────────────────────────────────
  describe('NotificationEventStatus', () => {
    describe('Factory methods estáticos', () => {
      it('pending() debe crear un estado "pending"', () => {
        const vo = NotificationEventStatus.pending();
        expect(vo.value).toBe('pending');
        expect(vo.isPending()).toBe(true);
        expect(vo.isSent()).toBe(false);
        expect(vo.isFailed()).toBe(false);
      });

      it('sent() debe crear un estado "sent"', () => {
        const vo = NotificationEventStatus.sent();
        expect(vo.value).toBe('sent');
        expect(vo.isSent()).toBe(true);
        expect(vo.isPending()).toBe(false);
        expect(vo.isFailed()).toBe(false);
      });

      it('failed() debe crear un estado "failed"', () => {
        const vo = NotificationEventStatus.failed();
        expect(vo.value).toBe('failed');
        expect(vo.isFailed()).toBe(true);
        expect(vo.isPending()).toBe(false);
        expect(vo.isSent()).toBe(false);
      });
    });

    describe('create() con string', () => {
      it('debe aceptar "pending", "sent" y "failed"', () => {
        expect(NotificationEventStatus.create('pending').value).toBe('pending');
        expect(NotificationEventStatus.create('sent').value).toBe('sent');
        expect(NotificationEventStatus.create('failed').value).toBe('failed');
      });

      it('debe normalizar a minúsculas', () => {
        const vo = NotificationEventStatus.create('PENDING');
        expect(vo.value).toBe('pending');
      });

      it('debe lanzar ValidationException para estado inválido', () => {
        expect(() => NotificationEventStatus.create('processing')).toThrow();
        expect(() => NotificationEventStatus.create('')).toThrow();
      });
    });

    describe('equals()', () => {
      it('debe retornar true para el mismo estado', () => {
        const a = NotificationEventStatus.pending();
        const b = NotificationEventStatus.pending();
        expect(a.equals(b)).toBe(true);
      });

      it('debe retornar false para estados distintos', () => {
        const a = NotificationEventStatus.pending();
        const b = NotificationEventStatus.sent();
        expect(a.equals(b)).toBe(false);
      });
    });

    describe('toString()', () => {
      it('debe retornar la representación en string', () => {
        expect(NotificationEventStatus.sent().toString()).toBe('sent');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 5. NotificationRecipientType
  // ─────────────────────────────────────────────────────────────────────
  describe('NotificationRecipientType', () => {
    describe('Factory methods estáticos', () => {
      it('customer() debe crear tipo "customer"', () => {
        const vo = NotificationRecipientType.customer();
        expect(vo.value).toBe('customer');
        expect(vo.isCustomer()).toBe(true);
        expect(vo.isUser()).toBe(false);
      });

      it('user() debe crear tipo "user"', () => {
        const vo = NotificationRecipientType.user();
        expect(vo.value).toBe('user');
        expect(vo.isUser()).toBe(true);
        expect(vo.isCustomer()).toBe(false);
      });
    });

    describe('create() con string', () => {
      it('debe aceptar "customer" y "user"', () => {
        expect(NotificationRecipientType.create('customer').value).toBe('customer');
        expect(NotificationRecipientType.create('user').value).toBe('user');
      });

      it('debe lanzar excepción para tipos inválidos', () => {
        expect(() => NotificationRecipientType.create('admin')).toThrow();
        expect(() => NotificationRecipientType.create('')).toThrow();
      });
    });

    describe('equals()', () => {
      it('debe comparar correctamente tipos iguales y distintos', () => {
        const a = NotificationRecipientType.customer();
        const b = NotificationRecipientType.customer();
        const c = NotificationRecipientType.user();
        expect(a.equals(b)).toBe(true);
        expect(a.equals(c)).toBe(false);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 6. NotificationEventId
  // ─────────────────────────────────────────────────────────────────────
  describe('NotificationEventId', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('debe crear un NotificationEventId con UUID válido', () => {
      const vo = NotificationEventId.create(validUuid);
      expect(vo.value).toBe(validUuid);
    });

    it('debe lanzar excepción con un UUID malformado', () => {
      expect(() => NotificationEventId.create('not-a-uuid')).toThrow();
    });

    it('debe lanzar excepción con UUID vacío', () => {
      expect(() => NotificationEventId.create('')).toThrow();
    });

    it('equals() debe comparar UUIDs correctamente', () => {
      const differentUuid = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';
      const a = NotificationEventId.create(validUuid);
      const b = NotificationEventId.create(validUuid);
      const c = NotificationEventId.create(differentUuid);
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    it('toString() debe retornar el UUID', () => {
      const vo = NotificationEventId.create(validUuid);
      expect(vo.toString()).toBe(validUuid);
    });
  });
});
