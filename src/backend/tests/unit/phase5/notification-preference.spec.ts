import { NotificationPreference } from '../../../src/domain/entities/notification-preference.entity';

/**
 * Pruebas Unitarias: Entidad NotificationPreference
 *
 * Cubre:
 * - create()        → Factory method para nueva preferencia
 * - reconstitute()  → Restaurar desde BD con estado pre-existente
 * - setEnabled()    → Habilitar/deshabilitar canal
 * - setFrequency()  → Cambiar frecuencia (immediately, daily, weekly)
 * - toPrimitives()  → Serialización para capa de persistencia
 *
 * Principio DDD: La entidad encapsula todas las invariantes del negocio.
 * El dominio valida la frecuencia; valores inválidos lanzan Error.
 */
describe('Entidad NotificationPreference — Capa de Dominio', () => {
  // UUID válidos para tests (formato UUID v4 estricto)
  const customerId = '550e8400-e29b-41d4-a716-446655440010';
  const topicId    = '550e8400-e29b-41d4-a716-446655440011';
  const channelId  = '550e8400-e29b-41d4-a716-446655440012';

  // ─────────────────────────────────────────────────────────────────────
  // 1. create()
  // ─────────────────────────────────────────────────────────────────────
  describe('create() — Factory method', () => {
    it('debe crear preferencia habilitada por defecto con frecuencia immediately', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });

      expect(pref.id).toBeDefined();
      expect(pref.customerId.value).toBe(customerId);
      expect(pref.topicId).toBe(topicId);
      expect(pref.channelId).toBe(channelId);
      expect(pref.isEnabled).toBe(true);
      expect(pref.frequency).toBe('immediately');
      expect(pref.createdAt).toBeInstanceOf(Date);
      expect(pref.updatedAt).toBeInstanceOf(Date);
    });

    it('debe respetar isEnabled=false si se pasa explícitamente', () => {
      const pref = NotificationPreference.create({
        customerId, topicId, channelId, isEnabled: false,
      });
      expect(pref.isEnabled).toBe(false);
    });

    it('debe respetar la frecuencia "daily" si se pasa explícitamente', () => {
      const pref = NotificationPreference.create({
        customerId, topicId, channelId, frequency: 'daily',
      });
      expect(pref.frequency).toBe('daily');
    });

    it('debe respetar la frecuencia "weekly" si se pasa explícitamente', () => {
      const pref = NotificationPreference.create({
        customerId, topicId, channelId, frequency: 'weekly',
      });
      expect(pref.frequency).toBe('weekly');
    });

    it('debe generar un ID único por instancia creada', () => {
      const p1 = NotificationPreference.create({ customerId, topicId, channelId });
      const p2 = NotificationPreference.create({ customerId, topicId, channelId });
      expect(p1.id).not.toBe(p2.id);
    });

    it('debe usar el ID provisto si se pasa en los props', () => {
      const providedId = '550e8400-e29b-41d4-a716-446655440099';
      const pref = NotificationPreference.create({
        id: providedId, customerId, topicId, channelId,
      });
      expect(pref.id).toBe(providedId);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 2. reconstitute()
  // ─────────────────────────────────────────────────────────────────────
  describe('reconstitute() — Restaurar desde persistencia', () => {
    it('debe restaurar correctamente todos los atributos de la BD', () => {
      const createdAt = new Date('2026-01-01T10:00:00Z');
      const updatedAt = new Date('2026-06-01T08:30:00Z');

      const pref = NotificationPreference.reconstitute({
        id: '550e8400-e29b-41d4-a716-446655440020',
        customerId,
        topicId,
        channelId,
        isEnabled: false,
        frequency: 'weekly',
        createdAt,
        updatedAt,
      });

      expect(pref.id).toBe('550e8400-e29b-41d4-a716-446655440020');
      expect(pref.isEnabled).toBe(false);
      expect(pref.frequency).toBe('weekly');
      expect(pref.createdAt).toBe(createdAt);
      expect(pref.updatedAt).toBe(updatedAt);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 3. setEnabled()
  // ─────────────────────────────────────────────────────────────────────
  describe('setEnabled() — Cambiar estado de habilitación', () => {
    it('debe deshabilitar una preferencia habilitada', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      const oldUpdatedAt = pref.updatedAt;

      // Pequeña pausa para garantizar que updatedAt cambie
      jest.useFakeTimers();
      jest.advanceTimersByTime(100);
      pref.setEnabled(false);
      jest.useRealTimers();

      expect(pref.isEnabled).toBe(false);
      expect(pref.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });

    it('debe habilitar una preferencia deshabilitada', () => {
      const pref = NotificationPreference.create({
        customerId, topicId, channelId, isEnabled: false,
      });
      pref.setEnabled(true);
      expect(pref.isEnabled).toBe(true);
    });

    it('debe actualizar updatedAt al cambiar el estado', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      const before = pref.updatedAt;

      jest.useFakeTimers();
      jest.advanceTimersByTime(500);
      pref.setEnabled(false);
      jest.useRealTimers();

      expect(pref.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 4. setFrequency()
  // ─────────────────────────────────────────────────────────────────────
  describe('setFrequency() — Cambiar frecuencia de notificaciones', () => {
    it('debe cambiar a "daily" exitosamente', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      pref.setFrequency('daily');
      expect(pref.frequency).toBe('daily');
    });

    it('debe cambiar a "weekly" exitosamente', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      pref.setFrequency('weekly');
      expect(pref.frequency).toBe('weekly');
    });

    it('debe cambiar de vuelta a "immediately"', () => {
      const pref = NotificationPreference.create({
        customerId, topicId, channelId, frequency: 'daily',
      });
      pref.setFrequency('immediately');
      expect(pref.frequency).toBe('immediately');
    });

    it('debe lanzar Error para frecuencia inválida "hourly"', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      expect(() => pref.setFrequency('hourly')).toThrow(
        'Invalid frequency: hourly. Valid values: immediately, daily, weekly',
      );
    });

    it('debe lanzar Error para frecuencia vacía', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      expect(() => pref.setFrequency('')).toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 5. toPrimitives()
  // ─────────────────────────────────────────────────────────────────────
  describe('toPrimitives() — Serialización para persistencia', () => {
    it('debe retornar un objeto plano con todos los campos', () => {
      const pref = NotificationPreference.create({
        customerId, topicId, channelId,
        isEnabled: true,
        frequency: 'daily',
      });

      const primitives = pref.toPrimitives();

      expect(typeof primitives.id).toBe('string');
      expect(primitives.customerId).toBe(customerId);
      expect(primitives.topicId).toBe(topicId);
      expect(primitives.channelId).toBe(channelId);
      expect(primitives.isEnabled).toBe(true);
      expect(primitives.frequency).toBe('daily');
      expect(primitives.createdAt).toBeInstanceOf(Date);
      expect(primitives.updatedAt).toBeInstanceOf(Date);
    });

    it('debe reflejar cambios hechos con setEnabled()', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      pref.setEnabled(false);

      const primitives = pref.toPrimitives();
      expect(primitives.isEnabled).toBe(false);
    });

    it('debe reflejar cambios hechos con setFrequency()', () => {
      const pref = NotificationPreference.create({ customerId, topicId, channelId });
      pref.setFrequency('weekly');

      const primitives = pref.toPrimitives();
      expect(primitives.frequency).toBe('weekly');
    });
  });
});
