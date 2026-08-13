import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, DeepPartial, FindOneOptions, FindManyOptions, EntityTarget } from 'typeorm';

export interface IDataAccessorContext {
  fetchRecord<T>(entityClass: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | null>;
  fetchRecords<T>(entityClass: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
  storeRecord<T>(entityClass: EntityTarget<T>, entity: T): Promise<T>;
  archiveRecord<T>(entityClass: EntityTarget<T>, entity: T): Promise<T>;
  buildRecord<T>(entityClass: EntityTarget<T>, entityLike: DeepPartial<T>): T;
}

class DataAccessorContext implements IDataAccessorContext {
  constructor(private readonly manager: EntityManager) {}

  async fetchRecord<T>(entityClass: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | null> {
    return this.manager.findOne(entityClass as any, options as any) as unknown as Promise<T | null>;
  }

  async fetchRecords<T>(entityClass: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]> {
    return this.manager.find(entityClass as any, options as any) as unknown as Promise<T[]>;
  }

  async storeRecord<T>(entityClass: EntityTarget<T>, entity: T): Promise<T> {
    return this.manager.save(entityClass, entity) as unknown as Promise<T>;
  }

  async archiveRecord<T>(entityClass: EntityTarget<T>, entity: T): Promise<T> {
    return this.manager.softRemove(entityClass as any, entity as any) as unknown as Promise<T>;
  }

  buildRecord<T>(entityClass: EntityTarget<T>, entityLike: DeepPartial<T>): T {
    return this.manager.create(entityClass as any, entityLike as any) as unknown as T;
  }
}

@Injectable()
export class DataAccessorProvider {
  constructor(private readonly dataSource: DataSource) {}

  async execute<T>(work: (txn: IDataAccessorContext) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      return work(new DataAccessorContext(manager));
    });
  }
}
