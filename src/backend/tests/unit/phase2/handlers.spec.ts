import { CreateServiceCommandHandler } from '../../../src/application/commands/create-service.command-handler';
import { CreateResourceCommandHandler } from '../../../src/application/commands/create-resource.command-handler';
import { ConfigureResourceAvailabilityCommandHandler } from '../../../src/application/commands/configure-resource-availability.command-handler';

import { Resource } from '../../../src/domain/entities/resource.entity';
import { ResourceNotFoundException } from '../../../src/domain/exceptions/resource-not-found.exception';

describe('Phase 2 Application Layer Command Handlers Unit Tests', () => {
  const validUuid1 = '123e4567-e89b-12d3-a456-426614174001';
  const validUuid2 = '123e4567-e89b-12d3-a456-426614174002';
  const validUuid3 = '123e4567-e89b-12d3-a456-426614174003';

  let mockServiceRepo: any;
  let mockResourceRepo: any;

  beforeEach(() => {
    mockServiceRepo = {
      save: jest.fn((s) => Promise.resolve(s)),
    };
    mockResourceRepo = {
      findById: jest.fn(),
      save: jest.fn((r) => Promise.resolve(r)),
      saveAvailabilityRule: jest.fn((rule) => Promise.resolve(rule)),
      saveBreak: jest.fn((brk) => Promise.resolve(brk)),
    };
  });

  describe('CreateServiceCommandHandler', () => {
    it('should create and save a service successfully', async () => {
      const handler = new CreateServiceCommandHandler(mockServiceRepo);

      const result = await handler.execute({
        tenantId: validUuid1,
        categoryId: validUuid2,
        name: 'Limpieza Dental',
        baseDurationMinutes: 45,
        basePrice: 150.0,
      });

      expect(result.id).toBeDefined();
      expect(mockServiceRepo.save).toHaveBeenCalledTimes(1);

      const savedService = mockServiceRepo.save.mock.calls[0][0];
      expect(savedService.name).toBe('Limpieza Dental');
      expect(savedService.baseDurationMinutes).toBe(45);
      expect(savedService.basePrice).toBe(150.0);
    });
  });

  describe('CreateResourceCommandHandler', () => {
    it('should create and save a resource successfully', async () => {
      const handler = new CreateResourceCommandHandler(mockResourceRepo);

      const result = await handler.execute({
        tenantId: validUuid1,
        branchId: validUuid2,
        typeId: validUuid3,
        name: 'Box Dental A',
        capacity: 1,
      });

      expect(result.id).toBeDefined();
      expect(mockResourceRepo.save).toHaveBeenCalledTimes(1);

      const savedResource = mockResourceRepo.save.mock.calls[0][0];
      expect(savedResource.name).toBe('Box Dental A');
      expect(savedResource.capacity).toBe(1);
    });
  });

  describe('ConfigureResourceAvailabilityCommandHandler', () => {
    it('should configure availability rules and breaks successfully', async () => {
      const handler = new ConfigureResourceAvailabilityCommandHandler(mockResourceRepo);

      const resource = Resource.create({
        id: validUuid1,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Dr. John Doe',
        capacity: 1,
      });
      mockResourceRepo.findById.mockResolvedValue(resource);

      const result = await handler.execute({
        resourceId: validUuid1,
        rules: [
          {
            dayOfWeek: 1, // Monday
            startTime: '08:00',
            endTime: '17:00',
            breaks: [
              {
                startTime: '13:00',
                endTime: '14:00',
              },
            ],
          },
        ],
      });

      expect(result.id).toBe(validUuid1);
      expect(mockResourceRepo.saveAvailabilityRule).toHaveBeenCalledTimes(1);
      expect(mockResourceRepo.saveBreak).toHaveBeenCalledTimes(1);

      const savedRule = mockResourceRepo.saveAvailabilityRule.mock.calls[0][0];
      expect(savedRule.dayOfWeek).toBe(1);
      expect(savedRule.shift.startTime).toBe('08:00');
      expect(savedRule.shift.endTime).toBe('17:00');

      const savedBreak = mockResourceRepo.saveBreak.mock.calls[0][0];
      expect(savedBreak.period.startTime).toBe('13:00');
      expect(savedBreak.period.endTime).toBe('14:00');
    });

    it('should throw ResourceNotFoundException if resource does not exist', async () => {
      const handler = new ConfigureResourceAvailabilityCommandHandler(mockResourceRepo);
      mockResourceRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute({
          resourceId: validUuid1,
          rules: [
            {
              dayOfWeek: 1,
              startTime: '08:00',
              endTime: '17:00',
            },
          ],
        })
      ).rejects.toThrow(ResourceNotFoundException);
    });

    it('should throw Error if a break falls outside the availability rule shift hours', async () => {
      const handler = new ConfigureResourceAvailabilityCommandHandler(mockResourceRepo);

      const resource = Resource.create({
        id: validUuid1,
        tenantId: validUuid2,
        branchId: validUuid3,
        typeId: validUuid1,
        name: 'Dr. John Doe',
        capacity: 1,
      });
      mockResourceRepo.findById.mockResolvedValue(resource);

      await expect(
        handler.execute({
          resourceId: validUuid1,
          rules: [
            {
              dayOfWeek: 1,
              startTime: '09:00', // Rule starts at 09:00
              endTime: '17:00',
              breaks: [
                {
                  startTime: '08:00', // Break is 08:00 - 09:00 (outside rule shift!)
                  endTime: '09:00',
                },
              ],
            },
          ],
        })
      ).rejects.toThrow('must be within availability rule hours');
    });
  });
});
