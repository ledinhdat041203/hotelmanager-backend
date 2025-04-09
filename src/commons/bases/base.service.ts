import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BaseService<T> {
  private readonly baseRepository: Repository<T>;
  private readonly newEntity: Function;
  @InjectEntityManager()
  protected readonly manager: EntityManager;

  constructor(baseRepository: Repository<T>, newEntity: Function) {
    this.baseRepository = baseRepository;
    this.newEntity = newEntity;
  }
}
