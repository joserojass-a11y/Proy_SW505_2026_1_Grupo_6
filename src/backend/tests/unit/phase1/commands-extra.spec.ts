import { UpdateCustomerCommandHandler } from '../../../src/application/commands/update-customer.command-handler';
import { UpdateProfileCommandHandler } from '../../../src/application/commands/update-profile.command-handler';
import { CustomerNotFoundException } from '../../../src/domain/exceptions/customer-not-found.exception';
import { UserNotFoundException } from '../../../src/domain/exceptions/user-not-found.exception';
import { UserAlreadyExistsException } from '../../../src/domain/exceptions/user-already-exists.exception';
import { Customer } from '../../../src/domain/entities/customer.entity';
import { User } from '../../../src/domain/entities/user.entity';

describe('Phase 1 Extra Command Handlers - Equivalencia, Límites y Caminos', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  
  describe('UpdateCustomerCommandHandler', () => {
    let mockCustomerRepo: any;
    let handler: UpdateCustomerCommandHandler;

    beforeEach(() => {
      mockCustomerRepo = {
        findByUserId: jest.fn(),
        update: jest.fn(),
      };
      handler = new UpdateCustomerCommandHandler(mockCustomerRepo);
    });

    it('[Feliz] Debe actualizar un cliente cuando se proveen todos los campos opcionales', async () => {
      const mockCustomer = Customer.create({
        id: validUuid,
        tenantId: validUuid,
        zoneId: validUuid,
        userId: validUuid,
        firstName: 'Old',
        lastName: 'Name',
        email: 'old@test.com',
        phone: '123456',
        timezone: 'UTC',
        consentSigned: true,
      });
      mockCustomerRepo.findByUserId.mockResolvedValue(mockCustomer);
      mockCustomerRepo.update.mockResolvedValue(mockCustomer);

      const result = await handler.execute({
        userId: validUuid,
        firstName: 'New',
        lastName: 'Name',
        email: 'new@test.com',
        phone: '123456',
        timezone: 'UTC',
      });

      expect(result.firstName).toBe('New');
      expect(result.email).toBe('new@test.com');
      expect(mockCustomerRepo.update).toHaveBeenCalled();
    });

    it('[Feliz/Límites] Debe actualizar un cliente ignorando campos opcionales no provistos (undefined)', async () => {
      const mockCustomer = Customer.create({
        id: validUuid,
        tenantId: validUuid,
        zoneId: validUuid,
        userId: validUuid,
        firstName: 'Old',
        lastName: 'Name',
        email: 'old@test.com',
        phone: '123456',
        timezone: 'UTC',
        consentSigned: true,
      });
      mockCustomerRepo.findByUserId.mockResolvedValue(mockCustomer);
      mockCustomerRepo.update.mockResolvedValue(mockCustomer);

      // Omite el email y phone
      const result = await handler.execute({
        userId: validUuid,
        firstName: 'New',
        lastName: 'Name',
      });

      // El email original se mantiene o se ignora su actualización
      expect(result.firstName).toBe('New');
      expect(mockCustomerRepo.update).toHaveBeenCalled();
    });

    it('[Negativo] Debe lanzar CustomerNotFoundException si no existe el cliente', async () => {
      mockCustomerRepo.findByUserId.mockResolvedValue(null);

      await expect(
        handler.execute({ userId: validUuid, firstName: 'Test', lastName: 'Test' })
      ).rejects.toThrow(CustomerNotFoundException);
    });
  });

  describe('UpdateProfileCommandHandler', () => {
    let mockUserRepo: any;
    let handler: UpdateProfileCommandHandler;

    beforeEach(() => {
      mockUserRepo = {
        findById: jest.fn(),
        existsByEmail: jest.fn(),
        update: jest.fn(),
      };
      handler = new UpdateProfileCommandHandler(mockUserRepo);
    });

    it('[Feliz] Debe actualizar el perfil completo cuando se proveen todos los campos opcionales', async () => {
      const mockUser = User.create({
        id: validUuid,
        email: 'old@test.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Old Name',
      });
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.existsByEmail.mockResolvedValue(false);

      await handler.execute({
        userId: validUuid,
        email: 'new@test.com',
        fullName: 'New Name',
      });

      expect(mockUserRepo.update).toHaveBeenCalled();
    });

    it('[Feliz/Límites] Debe actualizar el perfil ignorando campos no provistos', async () => {
      const mockUser = User.create({
        id: validUuid,
        email: 'old@test.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Old Name',
      });
      mockUserRepo.findById.mockResolvedValue(mockUser);

      // Omite email, no debería llamar a existsByEmail
      await handler.execute({
        userId: validUuid,
        fullName: 'New Name',
      });

      expect(mockUserRepo.existsByEmail).not.toHaveBeenCalled();
      expect(mockUserRepo.update).toHaveBeenCalled();
    });

    it('[Negativo] Debe lanzar UserNotFoundException si el usuario no existe', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute({ userId: validUuid })
      ).rejects.toThrow(UserNotFoundException);
    });

    it('[Negativo/Equivalencia] Debe lanzar UserAlreadyExistsException si el nuevo email ya está en uso', async () => {
      const mockUser = User.create({
        id: validUuid,
        email: 'old@test.com',
        passwordHash: 'b'.repeat(60),
        fullName: 'Old Name',
      });
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.existsByEmail.mockResolvedValue(true);

      await expect(
        handler.execute({ userId: validUuid, email: 'taken@test.com' })
      ).rejects.toThrow(UserAlreadyExistsException);
    });
  });
});
