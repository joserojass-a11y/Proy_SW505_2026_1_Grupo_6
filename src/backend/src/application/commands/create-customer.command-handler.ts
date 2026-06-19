import { randomUUID } from 'crypto';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerAlreadyExistsException } from '../../domain/exceptions/customer-already-exists.exception';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantNotFoundException } from '../../domain/exceptions/tenant-not-found.exception';
import { Email } from '../../domain/value-objects/email.vo';
import { CustomerId } from '../../domain/value-objects/customer-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { TenantId } from '../../domain/value-objects/tenant-id.vo';
import { CreateCustomerCommand } from './create-customer.command';

export interface CustomerResponseDto {
  id: string;
  tenantId: string;
  zoneId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
  preferences: Record<string, unknown>;
  consentSigned: boolean;
  createdAt: string;
  updatedAt: string;
}

export class CreateCustomerCommandHandler {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<CustomerResponseDto> {
    const tenantId = TenantId.create(command.tenantId);
    const tenant = await this.tenantRepository.findById(tenantId);

    if (!tenant) {
      throw new TenantNotFoundException(command.tenantId);
    }

    const userId = UserId.create(command.userId);
    const existingCustomer = await this.customerRepository.findByUserId(userId);

    if (existingCustomer) {
      throw new CustomerAlreadyExistsException(userId.value);
    }

    const customer = Customer.create({
      id: CustomerId.create(randomUUID()),
      tenantId: tenantId,
      zoneId: command.zoneId,
      userId,
      firstName: command.firstName,
      lastName: command.lastName,
      email: Email.create(command.email),
      phone: command.phone,
      timezone: command.timezone,
      preferences: command.preferences,
      consentSigned: command.consentSigned,
    });

    const savedCustomer = await this.customerRepository.save(customer);
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
