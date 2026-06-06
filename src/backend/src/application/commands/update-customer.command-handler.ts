import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import { UpdateCustomerCommand } from './update-customer.command';
import { CustomerResponseDto } from './create-customer.command-handler';
import { Customer } from '../../domain/entities/customer.entity';

export class UpdateCustomerCommandHandler {
  constructor(private readonly customerRepository: CustomerRepository) { }

  async execute(command: UpdateCustomerCommand): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findByUserId(UserId.create(command.userId));

    if (!customer) {
      throw new CustomerNotFoundException(command.userId);
    }

    customer.updateProfile({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email ? Email.create(command.email) : undefined,
      phone: command.phone,
      timezone: command.timezone,
      preferences: command.preferences,
      consentSigned: command.consentSigned,
    });

    const savedCustomer = await this.customerRepository.update(customer);
    return this.toDto(savedCustomer);
  }

  private toDto(customer: Customer): CustomerResponseDto {
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
