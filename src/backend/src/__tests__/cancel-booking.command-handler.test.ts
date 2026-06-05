import { CancelBookingCommandHandler } from '../../application/commands/cancel-booking.command-handler';
import { CancelBookingCommand } from '../../application/commands/cancel-booking.command';
import { Booking } from '../../domain/entities/booking.entity';
import { BookingId } from '../../domain/value-objects/booking-id.vo';
import { BranchId } from '../../domain/value-objects/branch-id.vo';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { ServiceId } from '../../domain/value-objects/service-id.vo';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import { BookingNotFoundException } from '../../domain/exceptions/booking-not-found.exception';

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
      id: BookingId.create('booking-1'),
      tenantId: TenantId.create('tenant-1'),
      branchId: BranchId.create('branch-1'),
      serviceId: ServiceId.create('service-1'),
      customerId: CustomerId.create('customer-1'),
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: UserId.create('user-1'),
    });

    booking.confirm(); // Move to CONFIRMED state
    await mockRepository.save(booking);

    const command: CancelBookingCommand = {
      bookingId: 'booking-1',
      reasonCode: 'CUSTOMER_REQUEST',
      description: 'Customer requested cancellation',
      cancelledBy: 'user-2',
    };

    const result = await handler.execute(command);

    expect(result.status).toBe('CANCELLED');
  });

  it('should throw error if booking not found', async () => {
    const command: CancelBookingCommand = {
      bookingId: 'non-existent-id',
      reasonCode: 'CUSTOMER_REQUEST',
      cancelledBy: 'user-2',
    };

    await expect(handler.execute(command)).rejects.toThrow(BookingNotFoundException);
  });
});
