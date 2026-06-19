import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { GetCustomerProfileQuery } from './get-customer-profile.query';
import { CustomerResponseDto } from '../commands/create-customer.command-handler';

export class GetCustomerProfileQueryHandler {
  constructor(private readonly customerRepository: CustomerRepository) { }

  async execute(query: GetCustomerProfileQuery): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findByUserId(UserId.create(query.userId));

    if (!customer) {
      throw new CustomerNotFoundException(query.userId);
    }

    const primitives = customer.toPrimitives();

    return {
      id: primitives.id,
      tenantId: primitives.tenantId,
      zoneId: primitives.zoneId,
      userId: primitives.userId,
      firstName: primitives.firstName,
      lastName: primitives.lastName,
      email: primitives.email,
      phone: primitives.phone,
      timezone: primitives.timezone,
      preferences: primitives.preferences,
      consentSigned: primitives.consentSigned,
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    };
  }
}
