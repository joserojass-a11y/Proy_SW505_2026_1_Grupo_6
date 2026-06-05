import { Booking } from '../domain/entities/booking.entity';
import { BookingId } from '../domain/value-objects/booking-id.vo';
import { BranchId } from '../domain/value-objects/branch-id.vo';
import { CustomerId } from '../domain/value-objects/customer-id.vo';
import { ServiceId } from '../domain/value-objects/service-id.vo';
import { TenantId } from '../domain/value-objects/tenant-id.vo';
import { UserId } from '../domain/value-objects/user-id.vo';
import { InvalidBookingDateRangeException } from '../domain/exceptions/invalid-booking-date-range.exception';
import { InvalidTransitionException } from '../domain/exceptions/invalid-transition.exception';

describe('Booking Entity', () => {
  const createTestBooking = (overrides?: Partial<any>) => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    return Booking.create({
      id: BookingId.create('test-id'),
      tenantId: TenantId.create('123e4567-e89b-12d3-a456-426614174001'),
      branchId: BranchId.create('123e4567-e89b-12d3-a456-426614174002'),
      serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174003'),
      customerId: CustomerId.create('123e4567-e89b-12d3-a456-426614174004'),
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: UserId.create('123e4567-e89b-12d3-a456-426614174005'),
      ...overrides,
    });
  };

  describe('create', () => {
    it('should create a booking with valid data', () => {
      const booking = createTestBooking();

      expect(booking.id.value).toBe('test-id');
      expect(booking.status.isPending()).toBe(true);
      expect(booking.createdAt).toBeDefined();
      expect(booking.updatedAt).toBeDefined();
    });

    it('should throw error if startsAt >= endsAt', () => {
      const now = new Date();

      expect(() =>
        Booking.create({
          id: BookingId.create('test-id'),
          tenantId: TenantId.create('123e4567-e89b-12d3-a456-426614174001'),
          branchId: BranchId.create('123e4567-e89b-12d3-a456-426614174002'),
          serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174003'),
          customerId: CustomerId.create('123e4567-e89b-12d3-a456-426614174004'),
          startsAt: now,
          endsAt: now, // Same as startsAt - invalid!
          customerTimezone: 'America/New_York',
          sourceChannel: 'WEB',
          createdBy: UserId.create('123e4567-e89b-12d3-a456-426614174005'),
        }),
      ).toThrow(InvalidBookingDateRangeException);
    });

    it('should set status to PENDING by default', () => {
      const booking = createTestBooking();
      expect(booking.status.isPending()).toBe(true);
    });
  });

  describe('state transitions', () => {
    it('should allow transition from PENDING to CONFIRMED', () => {
      const booking = createTestBooking();
      expect(booking.status.isPending()).toBe(true);

      booking.confirm();
      expect(booking.status.isConfirmed()).toBe(true);
    });

    it('should allow transition from PENDING to CANCELLED', () => {
      const booking = createTestBooking();
      expect(booking.status.isPending()).toBe(true);

      booking.cancel();
      expect(booking.status.isCancelled()).toBe(true);
    });

    it('should allow transition from CONFIRMED to CANCELLED', () => {
      const booking = createTestBooking();
      booking.confirm();
      expect(booking.status.isConfirmed()).toBe(true);

      booking.cancel();
      expect(booking.status.isCancelled()).toBe(true);
    });

    it('should throw error for invalid state transition', () => {
      const booking = createTestBooking();
      booking.cancel();

      // Cannot transition from CANCELLED to any other state
      expect(() => booking.confirm()).toThrow(InvalidTransitionException);
    });

    it('should allow transition from CONFIRMED to RESCHEDULED', () => {
      const booking = createTestBooking();
      booking.confirm();

      const newStart = new Date(booking.startsAt.getTime() + 86400000); // +1 day
      const newEnd = new Date(newStart.getTime() + 3600000); // +1 hour

      booking.reschedule(newStart, newEnd);
      expect(booking.status.isRescheduled()).toBe(true);
      expect(booking.startsAt).toEqual(newStart);
      expect(booking.endsAt).toEqual(newEnd);
    });

    it('should allow transition from CONFIRMED to COMPLETED', () => {
      const booking = createTestBooking();
      booking.confirm();

      booking.complete();
      expect(booking.status.isCompleted()).toBe(true);
    });

    it('should allow transition from CONFIRMED to NO_SHOW', () => {
      const booking = createTestBooking();
      booking.confirm();

      booking.markAsNoShow();
      expect(booking.status.isNoShow()).toBe(true);
    });
  });

  describe('conflict detection', () => {
    it('should detect overlapping bookings for the same service', () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 3600000);
      const twoHoursLater = new Date(now.getTime() + 7200000);

      const booking1 = createTestBooking({
        startsAt: now,
        endsAt: twoHoursLater,
      });

      const booking2 = createTestBooking({
        id: BookingId.create('test-id-2'),
        startsAt: oneHourLater,
        endsAt: twoHoursLater,
      });

      expect(booking1.hasConflictWith(booking2)).toBe(true);
      expect(booking2.hasConflictWith(booking1)).toBe(true);
    });

    it('should not detect conflict for different services', () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 3600000);
      const twoHoursLater = new Date(now.getTime() + 7200000);

      const booking1 = createTestBooking({
        serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174003'),
        startsAt: now,
        endsAt: twoHoursLater,
      });

      const booking2 = createTestBooking({
        id: BookingId.create('test-id-2'),
        serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174013'), // Different service
        startsAt: now,
        endsAt: twoHoursLater,
      });

      expect(booking1.hasConflictWith(booking2)).toBe(false);
    });

    it('should not detect conflict for non-overlapping time slots', () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 3600000);
      const twoHoursLater = new Date(now.getTime() + 7200000);
      const threeHoursLater = new Date(now.getTime() + 10800000);

      const booking1 = createTestBooking({
        startsAt: now,
        endsAt: oneHourLater,
      });

      const booking2 = createTestBooking({
        id: BookingId.create('test-id-2'),
        startsAt: twoHoursLater,
        endsAt: threeHoursLater,
      });

      expect(booking1.hasConflictWith(booking2)).toBe(false);
    });
  });

  describe('primitives conversion', () => {
    it('should convert to primitives correctly', () => {
      const booking = createTestBooking();
      const primitives = booking.toPrimitives();

      expect(primitives.id).toBe('test-id');
      expect(primitives.tenantId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(primitives.status).toBe('PENDING');
      expect(primitives.createdAt).toBeDefined();
      expect(primitives.updatedAt).toBeDefined();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute from primitives', () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 3600000);

      const reconstituted = Booking.reconstitute({
        id: BookingId.create('test-id'),
        tenantId: TenantId.create('123e4567-e89b-12d3-a456-426614174001'),
        branchId: BranchId.create('123e4567-e89b-12d3-a456-426614174002'),
        serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174003'),
        customerId: CustomerId.create('123e4567-e89b-12d3-a456-426614174004'),
        startsAt: now,
        endsAt: oneHourLater,
        customerTimezone: 'America/New_York',
        status: 'PENDING',
        sourceChannel: 'WEB',
        createdBy: UserId.create('123e4567-e89b-12d3-a456-426614174005'),
        createdAt: now,
        updatedAt: now,
      });

      expect(reconstituted.id.value).toBe('test-id');
      expect(reconstituted.status.isPending()).toBe(true);
    });
  });
});
