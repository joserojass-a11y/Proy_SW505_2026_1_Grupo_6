import { ResourceAvailabilityRuleId } from '../../../../src/domain/value-objects/availability-rule-id.vo';
import { BranchId } from '../../../../src/domain/value-objects/branch-id.vo';
import { ResourceBreakId } from '../../../../src/domain/value-objects/break-id.vo';
import { CategoryId } from '../../../../src/domain/value-objects/category-id.vo';
import { ResourceId } from '../../../../src/domain/value-objects/resource-id.vo';
import { ResourceTypeId } from '../../../../src/domain/value-objects/resource-type-id.vo';
import { ScheduleSlotId } from '../../../../src/domain/value-objects/schedule-slot-id.vo';
import { ServiceId } from '../../../../src/domain/value-objects/service-id.vo';

import { InvalidAvailabilityRuleIdException } from '../../../../src/domain/exceptions/invalid-availability-rule-id.exception';
import { InvalidBranchIdException } from '../../../../src/domain/exceptions/invalid-branch-id.exception';
import { InvalidBreakIdException } from '../../../../src/domain/exceptions/invalid-break-id.exception';
import { InvalidCategoryIdException } from '../../../../src/domain/exceptions/invalid-category-id.exception';
import { InvalidResourceIdException } from '../../../../src/domain/exceptions/invalid-resource-id.exception';
import { InvalidResourceTypeIdException } from '../../../../src/domain/exceptions/invalid-resource-type-id.exception';
import { InvalidScheduleSlotIdException } from '../../../../src/domain/exceptions/invalid-schedule-slot-id.exception';
import { InvalidServiceIdException } from '../../../../src/domain/exceptions/invalid-service-id.exception';

describe('Phase 2 Value Objects - Equivalencia, Límites y Caminos', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const invalidUuid = 'not-a-uuid';

  describe('UUID Value Objects (Equivalencia, Límites, Feliz/Negativo)', () => {
    
    it('[Feliz] Debe crear IDs válidos para todas las entidades', () => {
      expect(ResourceAvailabilityRuleId.create(validUuid).value).toBe(validUuid);
      expect(BranchId.create(validUuid).value).toBe(validUuid);
      expect(ResourceBreakId.create(validUuid).value).toBe(validUuid);
      expect(CategoryId.create(validUuid).value).toBe(validUuid);
      expect(ResourceId.create(validUuid).value).toBe(validUuid);
      expect(ResourceTypeId.create(validUuid).value).toBe(validUuid);
      expect(ScheduleSlotId.create(validUuid).value).toBe(validUuid);
      expect(ServiceId.create(validUuid).value).toBe(validUuid);
    });

    it('[Negativo] Debe lanzar excepciones específicas para UUIDs inválidos', () => {
      expect(() => ResourceAvailabilityRuleId.create(invalidUuid)).toThrow(InvalidAvailabilityRuleIdException);
      expect(() => BranchId.create(invalidUuid)).toThrow(InvalidBranchIdException);
      expect(() => ResourceBreakId.create(invalidUuid)).toThrow(InvalidBreakIdException);
      expect(() => CategoryId.create(invalidUuid)).toThrow(InvalidCategoryIdException);
      expect(() => ResourceId.create(invalidUuid)).toThrow(InvalidResourceIdException);
      expect(() => ResourceTypeId.create(invalidUuid)).toThrow(InvalidResourceTypeIdException);
      expect(() => ScheduleSlotId.create(invalidUuid)).toThrow(InvalidScheduleSlotIdException);
      expect(() => ServiceId.create(invalidUuid)).toThrow(InvalidServiceIdException);
    });

    it('[Límites] Debe manejar fromNullable correctamente (null o indefinido vs valor válido)', () => {
      // Límites de valores: Cuando no hay valor (null/undefined)
      expect(ResourceAvailabilityRuleId.fromNullable(null)).toBeNull();
      expect(BranchId.fromNullable(undefined)).toBeNull();
      
      // Cuando hay valor (borde válido)
      const resourceId = ResourceId.fromNullable(validUuid);
      expect(resourceId).not.toBeNull();
      expect(resourceId!.value).toBe(validUuid);

      const serviceId = ServiceId.fromNullable(validUuid);
      expect(serviceId).not.toBeNull();
      expect(serviceId!.value).toBe(validUuid);
    });

    it('[Equivalencia] Debe comparar instancias correctamente mediante .equals()', () => {
      // Misma clase de equivalencia (mismo ID exacto)
      const id1 = ResourceId.create(validUuid);
      const id2 = ResourceId.create(validUuid);
      
      // Diferente clase de equivalencia (diferente ID)
      const id3 = ResourceId.create('123e4567-e89b-12d3-a456-426614174001');

      // Prueba de comportamientos idénticos
      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);

      // Branch Id equals
      const b1 = BranchId.create(validUuid);
      const b2 = BranchId.create(validUuid);
      expect(b1.equals(b2)).toBe(true);
      
      const br1 = ResourceBreakId.create(validUuid);
      const br2 = ResourceBreakId.create(validUuid);
      expect(br1.equals(br2)).toBe(true);

      const cat1 = CategoryId.create(validUuid);
      const cat2 = CategoryId.create(validUuid);
      expect(cat1.equals(cat2)).toBe(true);

      const type1 = ResourceTypeId.create(validUuid);
      const type2 = ResourceTypeId.create(validUuid);
      expect(type1.equals(type2)).toBe(true);

      const slot1 = ScheduleSlotId.create(validUuid);
      const slot2 = ScheduleSlotId.create(validUuid);
      expect(slot1.equals(slot2)).toBe(true);

      const rule1 = ResourceAvailabilityRuleId.create(validUuid);
      const rule2 = ResourceAvailabilityRuleId.create(validUuid);
      expect(rule1.equals(rule2)).toBe(true);
    });
  });
});
