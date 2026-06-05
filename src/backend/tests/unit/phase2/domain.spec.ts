import { Service } from '../../../src/domain/entities/service.entity';
import { Resource } from '../../../src/domain/entities/resource.entity';
import { ResourceAvailabilityRule } from '../../../src/domain/entities/resource-availability-rule.entity';
import { ResourceBreak } from '../../../src/domain/entities/resource-break.entity';
import { ScheduleSlot } from '../../../src/domain/entities/schedule-slot.entity';

import { ServiceId } from '../../../src/domain/value-objects/service-id.vo';
import { ResourceId } from '../../../src/domain/value-objects/resource-id.vo';
import { CategoryId } from '../../../src/domain/value-objects/category-id.vo';
import { BranchId } from '../../../src/domain/value-objects/branch-id.vo';
import { ResourceTypeId } from '../../../src/domain/value-objects/resource-type-id.vo';
import { ResourceAvailabilityRuleId } from '../../../src/domain/value-objects/availability-rule-id.vo';
import { ResourceBreakId } from '../../../src/domain/value-objects/break-id.vo';
import { ScheduleSlotId } from '../../../src/domain/value-objects/schedule-slot-id.vo';
import { TenantId } from '../../../src/domain/value-objects/tenant-id.vo';
import { TimeRange } from '../../../src/domain/value-objects/time-range.vo';
import { TimeSlot } from '../../../src/domain/value-objects/time-slot.vo';

import { InvalidServiceIdException } from '../../../src/domain/exceptions/invalid-service-id.exception';
import { InvalidResourceIdException } from '../../../src/domain/exceptions/invalid-resource-id.exception';
import { InvalidCategoryIdException } from '../../../src/domain/exceptions/invalid-category-id.exception';
import { InvalidBranchIdException } from '../../../src/domain/exceptions/invalid-branch-id.exception';
import { InvalidResourceTypeIdException } from '../../../src/domain/exceptions/invalid-resource-type-id.exception';
import { InvalidAvailabilityRuleIdException } from '../../../src/domain/exceptions/invalid-availability-rule-id.exception';
import { InvalidBreakIdException } from '../../../src/domain/exceptions/invalid-break-id.exception';
import { InvalidScheduleSlotIdException } from '../../../src/domain/exceptions/invalid-schedule-slot-id.exception';
import { InvalidTimeRangeException } from '../../../src/domain/exceptions/invalid-time-range.exception';
import { InvalidTimeSlotException } from '../../../src/domain/exceptions/invalid-time-slot.exception';

describe('Phase 2 Domain Layer Unit Tests', () => {
  const validUuid1 = '123e4567-e89b-12d3-a456-426614174001';
  const validUuid2 = '123e4567-e89b-12d3-a456-426614174002';
  const validUuid3 = '123e4567-e89b-12d3-a456-426614174003';
  const invalidUuid = 'invalid-uuid-format';

  describe('Value Objects & Exception Tests', () => {
    it('should validate and throw proper exceptions for UUID Value Objects', () => {
      // ServiceId
      expect(ServiceId.create(validUuid1).value).toBe(validUuid1);
      expect(() => ServiceId.create(invalidUuid)).toThrow(InvalidServiceIdException);

      // ResourceId
      expect(ResourceId.create(validUuid1).value).toBe(validUuid1);
      expect(() => ResourceId.create(invalidUuid)).toThrow(InvalidResourceIdException);

      // CategoryId
      expect(CategoryId.create(validUuid1).value).toBe(validUuid1);
      expect(() => CategoryId.create(invalidUuid)).toThrow(InvalidCategoryIdException);

      // BranchId
      expect(BranchId.create(validUuid1).value).toBe(validUuid1);
      expect(() => BranchId.create(invalidUuid)).toThrow(InvalidBranchIdException);

      // ResourceTypeId
      expect(ResourceTypeId.create(validUuid1).value).toBe(validUuid1);
      expect(() => ResourceTypeId.create(invalidUuid)).toThrow(InvalidResourceTypeIdException);

      // ResourceAvailabilityRuleId
      expect(ResourceAvailabilityRuleId.create(validUuid1).value).toBe(validUuid1);
      expect(() => ResourceAvailabilityRuleId.create(invalidUuid)).toThrow(
        InvalidAvailabilityRuleIdException
      );

      // ResourceBreakId
      expect(ResourceBreakId.create(validUuid1).value).toBe(validUuid1);
      expect(() => ResourceBreakId.create(invalidUuid)).toThrow(InvalidBreakIdException);

      // ScheduleSlotId
      expect(ScheduleSlotId.create(validUuid1).value).toBe(validUuid1);
      expect(() => ScheduleSlotId.create(invalidUuid)).toThrow(InvalidScheduleSlotIdException);
    });

    describe('TimeRange Value Object', () => {
      it('should create and validate a correct date range', () => {
        const start = new Date('2026-06-04T10:00:00Z');
        const end = new Date('2026-06-04T12:00:00Z');
        const range = TimeRange.create(start, end);

        expect(range.startsAt.getTime()).toBe(start.getTime());
        expect(range.endsAt.getTime()).toBe(end.getTime());
        expect(range.durationInMinutes).toBe(120);
      });

      it('should throw InvalidTimeRangeException when dates are invalid or inverted', () => {
        const start = new Date('2026-06-04T12:00:00Z');
        const end = new Date('2026-06-04T10:00:00Z');

        expect(() => TimeRange.create(start, end)).toThrow(InvalidTimeRangeException);
        expect(() => TimeRange.create(new Date('invalid'), end)).toThrow(InvalidTimeRangeException);
      });

      it('should detect overlaps, containment, and equals correctly', () => {
        const r1 = TimeRange.create(new Date('2026-06-04T10:00:00Z'), new Date('2026-06-04T12:00:00Z'));
        const r2 = TimeRange.create(new Date('2026-06-04T11:00:00Z'), new Date('2026-06-04T13:00:00Z'));
        const r3 = TimeRange.create(new Date('2026-06-04T13:00:00Z'), new Date('2026-06-04T14:00:00Z'));

        expect(r1.overlaps(r2)).toBe(true);
        expect(r1.overlaps(r3)).toBe(false);
        expect(r1.contains(new Date('2026-06-04T11:00:00Z'))).toBe(true);
        expect(r1.contains(new Date('2026-06-04T13:00:00Z'))).toBe(false);

        const r1Copy = TimeRange.create(
          new Date('2026-06-04T10:00:00Z'),
          new Date('2026-06-04T12:00:00Z')
        );
        expect(r1.equals(r1Copy)).toBe(true);
        expect(r1.equals(r2)).toBe(false);
      });
    });

    describe('TimeSlot Value Object', () => {
      it('should create and validate a correct time of day slot', () => {
        const slot = TimeSlot.create('09:00', '13:00');
        expect(slot.startTime).toBe('09:00');
        expect(slot.endTime).toBe('13:00');
        expect(slot.durationInMinutes).toBe(240);
      });

      it('should handle HH:MM:SS format and normalize to HH:MM', () => {
        const slot = TimeSlot.create('09:00:00', '13:00:00');
        expect(slot.startTime).toBe('09:00');
        expect(slot.endTime).toBe('13:00');
      });

      it('should throw InvalidTimeSlotException for invalid format or inverted times', () => {
        expect(() => TimeSlot.create('13:00', '09:00')).toThrow(InvalidTimeSlotException);
        expect(() => TimeSlot.create('invalid', '12:00')).toThrow(InvalidTimeSlotException);
      });

      it('should detect overlaps and equals correctly', () => {
        const s1 = TimeSlot.create('08:00', '12:00');
        const s2 = TimeSlot.create('10:00', '14:00');
        const s3 = TimeSlot.create('14:00', '16:00');

        expect(s1.overlaps(s2)).toBe(true);
        expect(s1.overlaps(s3)).toBe(false);

        const s1Copy = TimeSlot.create('08:00', '12:00');
        expect(s1.equals(s1Copy)).toBe(true);
        expect(s1.equals(s2)).toBe(false);
      });
    });
  });

  describe('Service Entity', () => {
    it('should create and reconstitute a service entity', () => {
      const service = Service.create({
        id: validUuid1,
        tenantId: validUuid2,
        categoryId: validUuid3,
        name: 'Limpieza Dental',
        baseDurationMinutes: 45,
        basePrice: 150.0,
      });

      expect(service.id.value).toBe(validUuid1);
      expect(service.tenantId.value).toBe(validUuid2);
      expect(service.categoryId.value).toBe(validUuid3);
      expect(service.name).toBe('Limpieza Dental');
      expect(service.baseDurationMinutes).toBe(45);
      expect(service.basePrice).toBe(150.0);
      expect(service.isActive).toBe(true);

      const primitives = service.toPrimitives();
      expect(primitives.name).toBe('Limpieza Dental');

      const reconstituted = Service.reconstitute({
        id: validUuid1,
        tenantId: validUuid2,
        categoryId: validUuid3,
        name: 'Profilaxis Avanzada',
        baseDurationMinutes: 60,
        basePrice: 200.0,
        isActive: false,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      });

      expect(reconstituted.name).toBe('Profilaxis Avanzada');
      expect(reconstituted.isActive).toBe(false);
    });

    it('should enforce duration and price validations', () => {
      expect(() =>
        Service.create({
          tenantId: validUuid2,
          categoryId: validUuid3,
          name: 'Limpieza Dental',
          baseDurationMinutes: 0,
          basePrice: 150.0,
        })
      ).toThrow('Service base duration must be greater than 0');

      expect(() =>
        Service.create({
          tenantId: validUuid2,
          categoryId: validUuid3,
          name: 'Limpieza Dental',
          baseDurationMinutes: 30,
          basePrice: -5.0,
        })
      ).toThrow('Service base price cannot be negative');
    });

    it('should update profile properties and change activation status', () => {
      const service = Service.create({
        id: validUuid1,
        tenantId: validUuid2,
        categoryId: validUuid3,
        name: 'Limpieza Dental',
        baseDurationMinutes: 45,
        basePrice: 150.0,
      });

      service.updateProfile({
        name: 'Limpieza Dental Pro',
        baseDurationMinutes: 50,
        basePrice: 180.0,
      });

      expect(service.name).toBe('Limpieza Dental Pro');
      expect(service.baseDurationMinutes).toBe(50);
      expect(service.basePrice).toBe(180.0);

      service.deactivate();
      expect(service.isActive).toBe(false);

      service.activate();
      expect(service.isActive).toBe(true);
    });
  });

  describe('Resource Entity', () => {
    it('should create and reconstitute a resource entity', () => {
      const resource = Resource.create({
        id: validUuid1,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Consultorio 101',
        capacity: 1,
      });

      expect(resource.id.value).toBe(validUuid1);
      expect(resource.tenantId.value).toBe(validUuid2);
      expect(resource.branchId.value).toBe(validUuid3);
      expect(resource.typeId.value).toBe(validUuid1);
      expect(resource.name).toBe('Consultorio 101');
      expect(resource.capacity).toBe(1);

      const reconstituted = Resource.reconstitute({
        id: validUuid1,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Dr. John Doe',
        capacity: 2,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      });

      expect(reconstituted.name).toBe('Dr. John Doe');
      expect(reconstituted.capacity).toBe(2);
    });

    it('should enforce capacity validation', () => {
      expect(() =>
        Resource.create({
          tenantId: validUuid2,
          branchId: validUuid3,
          typeId: validUuid1,
          name: 'Consultorio 101',
          capacity: 0,
        })
      ).toThrow('Resource capacity must be at least 1');
    });

    it('should update resource info', () => {
      const resource = Resource.create({
        id: validUuid1,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Consultorio 101',
        capacity: 1,
      });

      const otherBranch = '123e4567-e89b-12d3-a456-426614174099';
      resource.updateInfo({
        name: 'Consultorio 102',
        capacity: 3,
        branchId: otherBranch,
      });

      expect(resource.name).toBe('Consultorio 102');
      expect(resource.capacity).toBe(3);
      expect(resource.branchId.value).toBe(otherBranch);
    });
  });

  describe('ResourceAvailabilityRule Entity', () => {
    it('should create and validate availability rule', () => {
      const rule = ResourceAvailabilityRule.create({
        id: validUuid1,
        resourceId: validUuid2,
        dayOfWeek: 1, // Lunes
        startTime: '08:00',
        endTime: '17:00',
        validFrom: new Date('2026-01-01T00:00:00Z'),
        validTo: new Date('2026-12-31T23:59:59Z'),
      });

      expect(rule.id.value).toBe(validUuid1);
      expect(rule.resourceId.value).toBe(validUuid2);
      expect(rule.dayOfWeek).toBe(1);
      expect(rule.shift.startTime).toBe('08:00');
      expect(rule.shift.endTime).toBe('17:00');

      // Validations on dates
      expect(() =>
        ResourceAvailabilityRule.create({
          id: validUuid1,
          resourceId: validUuid2,
          dayOfWeek: 8, // Invalid day
          startTime: '08:00',
          endTime: '17:00',
        })
      ).toThrow();

      expect(() =>
        ResourceAvailabilityRule.create({
          id: validUuid1,
          resourceId: validUuid2,
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '17:00',
          validFrom: new Date('2026-12-31T00:00:00Z'),
          validTo: new Date('2026-01-01T23:59:59Z'), // inverted
        })
      ).toThrow('ValidFrom date cannot be after ValidTo date');
    });

    it('should evaluate isValidOn correctly', () => {
      const rule = ResourceAvailabilityRule.create({
        id: validUuid1,
        resourceId: validUuid2,
        dayOfWeek: 1, // Lunes
        startTime: '09:00',
        endTime: '18:00',
        validFrom: new Date('2026-06-01T00:00:00Z'), // Monday, June 1, 2026
        validTo: new Date('2026-06-30T23:59:59Z'),
      });

      const validMonday = new Date('2026-06-08T10:00:00Z'); // Monday inside validity
      const validTuesday = new Date('2026-06-09T10:00:00Z'); // Tuesday (not matched day of week)
      const outOfRangeMonday = new Date('2026-07-06T10:00:00Z'); // Monday outside validity range

      expect(rule.isValidOn(validMonday)).toBe(true);
      expect(rule.isValidOn(validTuesday)).toBe(false);
      expect(rule.isValidOn(outOfRangeMonday)).toBe(false);
    });

    it('should update rule properties', () => {
      const rule = ResourceAvailabilityRule.create({
        id: validUuid1,
        resourceId: validUuid2,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
      });

      rule.updateRule({
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '18:00',
      });

      expect(rule.dayOfWeek).toBe(2);
      expect(rule.shift.startTime).toBe('10:00');
      expect(rule.shift.endTime).toBe('18:00');
    });
  });

  describe('ResourceBreak Entity', () => {
    it('should create and update a break', () => {
      const breakObj = ResourceBreak.create({
        id: validUuid1,
        availabilityRuleId: validUuid2,
        startTime: '13:00',
        endTime: '14:00',
      });

      expect(breakObj.id.value).toBe(validUuid1);
      expect(breakObj.availabilityRuleId.value).toBe(validUuid2);
      expect(breakObj.period.startTime).toBe('13:00');
      expect(breakObj.period.endTime).toBe('14:00');

      breakObj.updatePeriod(TimeSlot.create('12:00', '13:00'));
      expect(breakObj.period.startTime).toBe('12:00');
    });
  });

  describe('ScheduleSlot Entity', () => {
    it('should manage reservation status transitions correctly', () => {
      const start = new Date('2026-06-04T09:00:00Z');
      const end = new Date('2026-06-04T10:00:00Z');
      const slot = ScheduleSlot.create({
        id: validUuid1,
        resourceId: validUuid2,
        startsAt: start,
        endsAt: end,
      });

      expect(slot.status).toBe('AVAILABLE');
      expect(slot.bookingId).toBeNull();

      // Book
      const bookingId = 'booking-123';
      slot.book(bookingId);
      expect(slot.status).toBe('BOOKED');
      expect(slot.bookingId).toBe(bookingId);

      // Booked -> Available
      slot.cancelBooking();
      expect(slot.status).toBe('AVAILABLE');
      expect(slot.bookingId).toBeNull();

      // Block
      slot.block();
      expect(slot.status).toBe('BLOCKED');

      // Blocked -> Available
      slot.release();
      expect(slot.status).toBe('AVAILABLE');
    });

    it('should prevent invalid transitions', () => {
      const start = new Date('2026-06-04T09:00:00Z');
      const end = new Date('2026-06-04T10:00:00Z');
      const slot = ScheduleSlot.create({
        id: validUuid1,
        resourceId: validUuid2,
        startsAt: start,
        endsAt: end,
      });

      // 1. Try to cancel a booking when slot is AVAILABLE
      expect(() => slot.cancelBooking()).toThrow('Slot is not currently booked');

      // 2. Try to book an already booked slot
      slot.book('booking-1');
      expect(() => slot.book('booking-2')).toThrow('Slot is already booked');

      // 3. Try to block a booked slot
      expect(() => slot.block()).toThrow('Cannot block a booked slot');

      // 4. Try to book a blocked slot
      slot.cancelBooking();
      slot.block();
      expect(() => slot.book('booking-3')).toThrow('Slot is blocked and cannot be booked');
    });
  });
});
