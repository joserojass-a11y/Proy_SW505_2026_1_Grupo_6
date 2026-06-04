import { NotFoundException } from './not-found.exception';

export class ServiceNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Service not found: ${id}`, 'SERVICE_NOT_FOUND');
  }
}
