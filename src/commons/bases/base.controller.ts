import { BaseService } from './base.service';

export class BaseController<T, F extends BaseService<T>> {
  private readonly baseService: F;
  constructor(baseService: F) {
    this.baseService = baseService;
  }
}
