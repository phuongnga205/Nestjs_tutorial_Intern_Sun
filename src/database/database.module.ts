import { Module, Global } from '@nestjs/common';
import { DataAccessorProvider } from './data-accessor.provider';

@Global()
@Module({
  providers: [DataAccessorProvider],
  exports: [DataAccessorProvider],
})
export class DatabaseModule {}
