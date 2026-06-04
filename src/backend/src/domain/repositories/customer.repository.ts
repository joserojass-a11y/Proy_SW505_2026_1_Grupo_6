import { Customer } from '../entities/customer.entity';
import { CustomerId } from '../value-objects/customer-id.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface CustomerRepository {
  findById(id: CustomerId): Promise<Customer | null>;
  findByUserId(userId: UserId): Promise<Customer | null>;
  save(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<Customer>;
}
