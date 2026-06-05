import { CancelBookingCommandHandler } from '../../../src/application/commands/cancel-booking.command-handler';
import { CancelBookingCommand } from '../../../src/application/commands/cancel-booking.command';
import { Booking } from '../../../src/domain/entities/booking.entity';
import { BookingId } from '../../../src/domain/value-objects/booking-id.vo';
import { BranchId } from '../../../src/domain/value-objects/branch-id.vo';
import { CustomerId } from '../../../src/domain/value-objects/customer-id.vo';
import { ServiceId } from '../../../src/domain/value-objects/service-id.vo';
import { TenantId } from '../../../src/domain/value-objects/tenant-id.vo';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { BookingRepository } from '../../../src/domain/repositories/booking.repository';
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

describe('CancelBookingCommandHandler', () => {
  let handler: CancelBookingCommandHandler;
  let mockRepository: MockBookingRepository;

  beforeEach(() => {
    mockRepository = new MockBookingRepository();
    handler = new CancelBookingCommandHandler(mockRepository);
  });

  it('should cancel a booking successfully', async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const booking = Booking.create({
      id: BookingId.create('123e4567-e89b-12d3-a456-426614174006'),
      tenantId: TenantId.create('123e4567-e89b-12d3-a456-426614174001'),
      branchId: BranchId.create('123e4567-e89b-12d3-a456-426614174002'),
      serviceId: ServiceId.create('123e4567-e89b-12d3-a456-426614174003'),
      customerId: CustomerId.create('123e4567-e89b-12d3-a456-426614174004'),
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: UserId.create('123e4567-e89b-12d3-a456-426614174005'),
    });

    booking.confirm(); // Move to CONFIRMED state
    await mockRepository.save(booking);

    const command: CancelBookingCommand = {
      bookingId: '123e4567-e89b-12d3-a456-426614174006',
      reasonCode: 'CUSTOMER_REQUEST',
      description: 'Customer requested cancellation',
      cancelledBy: '123e4567-e89b-12d3-a456-426614174009',
    };

    const result = await handler.execute(command);

    expect(result.status).toBe('CANCELLED');
  });

  it('should throw error if booking not found', async () => {
    const command: CancelBookingCommand = {
      bookingId: '123e4567-e89b-12d3-a456-426614174006',
      reasonCode: 'CUSTOMER_REQUEST',
      cancelledBy: '123e4567-e89b-12d3-a456-426614174009',
    };

    await expect(handler.execute(command)).rejects.toThrow(BookingNotFoundException);
  });
});
