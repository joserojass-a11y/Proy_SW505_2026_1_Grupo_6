import { NotFoundException } from './not-found.exception';

export class ResourceNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Resource not found: ${id}`, 'RESOURCE_NOT_FOUND');
  }
}
