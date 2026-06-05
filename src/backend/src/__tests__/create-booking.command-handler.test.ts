import { CreateBookingCommandHandler } from '../application/commands/create-booking.command-handler';
import { CreateBookingCommand } from '../application/commands/create-booking.command';
import { BookingRepository } from '../domain/repositories/booking.repository';
import { IAvailabilityService } from '../application/services/availability.interface';
import { Booking } from '../domain/entities/booking.entity';
import { BookingAlreadyExistsException } from '../domain/exceptions/booking-already-exists.exception';

// Mock implementations
class MockBookingRepository implements BookingRepository {
  savedBooking: Booking | null = null;
  shouldThrowOnCreate = false;

  async findById() {
    return null;
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
    this.savedBooking = booking;
    return booking;
  }

  async update(booking: Booking) {
    return booking;
  }

  async deleteById() {}

  async createWithLocking(booking: Booking) {
    if (this.shouldThrowOnCreate) {
      throw new BookingAlreadyExistsException(booking.serviceId.value, booking.startsAt, booking.endsAt);
    }
    return booking;
  }
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

describe('CreateBookingCommandHandler', () => {
  let handler: CreateBookingCommandHandler;
  let mockRepository: MockBookingRepository;
  let mockAvailabilityService: MockAvailabilityService;

  beforeEach(() => {
    mockRepository = new MockBookingRepository();
    mockAvailabilityService = new MockAvailabilityService();
    handler = new CreateBookingCommandHandler(mockRepository, mockAvailabilityService);
  });

  it('should create a booking successfully', async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const command: CreateBookingCommand = {
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      branchId: '123e4567-e89b-12d3-a456-426614174002',
      serviceId: '123e4567-e89b-12d3-a456-426614174003',
      customerId: '123e4567-e89b-12d3-a456-426614174004',
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: '123e4567-e89b-12d3-a456-426614174005',
    };

    const result = await handler.execute(command);

    expect(result.id).toBeDefined();
    expect(result.status).toBe('PENDING');
    expect(result.startsAt).toEqual(now);
    expect(result.endsAt).toEqual(oneHourLater);
  });

  it('should throw error if service is not available', async () => {
    mockAvailabilityService.availableByDefault = false;

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const command: CreateBookingCommand = {
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      branchId: '123e4567-e89b-12d3-a456-426614174002',
      serviceId: '123e4567-e89b-12d3-a456-426614174003',
      customerId: '123e4567-e89b-12d3-a456-426614174004',
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: '123e4567-e89b-12d3-a456-426614174005',
    };

    await expect(handler.execute(command)).rejects.toThrow('not available');
  });

  it('should throw error if booking already exists', async () => {
    mockRepository.shouldThrowOnCreate = true;

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const command: CreateBookingCommand = {
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      branchId: '123e4567-e89b-12d3-a456-426614174002',
      serviceId: '123e4567-e89b-12d3-a456-426614174003',
      customerId: '123e4567-e89b-12d3-a456-426614174004',
      startsAt: now,
      endsAt: oneHourLater,
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: '123e4567-e89b-12d3-a456-426614174005',
    };

    await expect(handler.execute(command)).rejects.toThrow(BookingAlreadyExistsException);
  });

  it('should throw error if date range is invalid', async () => {
    const now = new Date();

    const command: CreateBookingCommand = {
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      branchId: '123e4567-e89b-12d3-a456-426614174002',
      serviceId: '123e4567-e89b-12d3-a456-426614174003',
      customerId: '123e4567-e89b-12d3-a456-426614174004',
      startsAt: now,
      endsAt: now, // Invalid - same as startsAt
      customerTimezone: 'America/New_York',
      sourceChannel: 'WEB',
      createdBy: '123e4567-e89b-12d3-a456-426614174005',
    };

    await expect(handler.execute(command)).rejects.toThrow('Invalid date range');
  });
});
