import { RescheduleBookingCommandHandler } from '../../../src/application/commands/reschedule-booking.command-handler';
import { RescheduleBookingCommand } from '../../../src/application/commands/reschedule-booking.command';
import { Booking } from '../../../src/domain/entities/booking.entity';
import { BookingId } from '../../../src/domain/value-objects/booking-id.vo';
import { BranchId } from '../../../src/domain/value-objects/branch-id.vo';
import { CustomerId } from '../../../src/domain/value-objects/customer-id.vo';
import { ServiceId } from '../../../src/domain/value-objects/service-id.vo';
import { TenantId } from '../../../src/domain/value-objects/tenant-id.vo';
import { ResourceId } from '../../../src/domain/value-objects/resource-id.vo';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { BookingRepository } from '../../../src/domain/repositories/booking.repository';
import { IAvailabilityService } from '../../../src/application/services/availability.interface';
import { BookingNotFoundException } from '../../../src/domain/exceptions/booking-not-found.exception';

class MockBookingRepository implements BookingRepository {
  bookings: Map<string, Booking> = new Map();

  async findById(id: BookingId) {
    return this.bookings.get(id.value) || null;
  }

  async findByIdAndTenant() {
    return null;
  }

  async findConflictingBookings() {
    return [];
  }

  async findConflictingBookingsForUpdate() {
    return [];
  }

  async listByServiceId() {
    return [];
  }

  async listByCustomerId() {
    return [];
  }

  async listByTenantId() {
    return [];
  }

  async save(booking: Booking) {
    this.bookings.set(booking.id.value, booking);
    return booking;
  }

  async update(booking: Booking) {
    this.bookings.set(booking.id.value, booking);
    return booking;
  }

  async deleteById() {}
}

class MockAvailabilityService implements IAvailabilityService {
  availableByDefault = true;

  async checkAvailability() {
    return this.availableByDefault;
  }

  async getAvailableSlots() {
    return [];
  }
}

describe('RescheduleBookingCommandHandler', () => {
  let handler: RescheduleBookingCommandHandler;
  let mockRepository: MockBookingRepository;
  let mockAvailabilityService: MockAvailabilityService;

  beforeEach(() => {
    mockRepository = new MockBookingRepository();
    mockAvailabilityService = new MockAvailabilityService();
    handler = new RescheduleBookingCommandHandler(mockRepository, mockAvailabilityService);
  });

  it('should reschedule a booking successfully', async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const booking = Booking.create({
      id: BookingId.create('123e4567-e89b-12d3-a456-426614174006'),
      tenantId: TenantId.create('123e4567-e89b-12d3-a456-426614174001'),
      branchId: BranchId.create('123e4567-e89b-12d3-a456-426614174002'),
      serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174003'),
      resourceId: ResourceId.create('123e4567-e89b-12d3-a456-426614174099'),
      customerId: CustomerId.create('123e4567-e89b-12d3-a456-426614174004'),
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: UserId.create('123e4567-e89b-12d3-a456-426614174005'),
    });

    booking.confirm(); // Move to CONFIRMED state
    await mockRepository.save(booking);

    const newStart = new Date(now.getTime() + 86400000); // +1 day
    const newEnd = new Date(newStart.getTime() + 3600000); // +1 hour

    const command: RescheduleBookingCommand = {
      bookingId: '123e4567-e89b-12d3-a456-426614174006',
      newStartsAt: newStart,
      newEndsAt: newEnd,
      reason: 'Customer requested',
      rescheduledBy: '123e4567-e89b-12d3-a456-426614174009',
    };

    const result = await handler.execute(command);

    expect(result.status).toBe('RESCHEDULED');
    expect(result.startsAt).toEqual(newStart);
    expect(result.endsAt).toEqual(newEnd);
  });

  it('should throw error if booking not found', async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const command: RescheduleBookingCommand = {
      bookingId: '123e4567-e89b-12d3-a456-426614174006',
      newStartsAt: now,
      newEndsAt: oneHourLater,
      rescheduledBy: '123e4567-e89b-12d3-a456-426614174009',
    };

    await expect(handler.execute(command)).rejects.toThrow(BookingNotFoundException);
  });

  it('should throw error if new slot is not available', async () => {
    mockAvailabilityService.availableByDefault = false;

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const booking = Booking.create({
      id: BookingId.create('123e4567-e89b-12d3-a456-426614174006'),
      tenantId: TenantId.create('123e4567-e89b-12d3-a456-426614174001'),
      branchId: BranchId.create('123e4567-e89b-12d3-a456-426614174002'),
      serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174003'),
      resourceId: ResourceId.create('123e4567-e89b-12d3-a456-426614174099'),
      customerId: CustomerId.create('123e4567-e89b-12d3-a456-426614174004'),
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: UserId.create('123e4567-e89b-12d3-a456-426614174005'),
    });

    booking.confirm();
    await mockRepository.save(booking);

    const newStart = new Date(now.getTime() + 86400000);
    const newEnd = new Date(newStart.getTime() + 3600000);

    const command: RescheduleBookingCommand = {
      bookingId: '123e4567-e89b-12d3-a456-426614174006',
      newStartsAt: newStart,
      newEndsAt: newEnd,
      rescheduledBy: '123e4567-e89b-12d3-a456-426614174009',
    };

    await expect(handler.execute(command)).rejects.toThrow('not available');
  });
});
