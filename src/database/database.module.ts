import { Global, Module } from '@nestjs/common';
import { DatabaseConfigService } from "./database.config";


@Global()
@Module({
  providers: [
    {
      provide: DatabaseConfigService,
      useValue: new DatabaseConfigService(),
    },
  ],
  exports: [DatabaseConfigService],
})
export class DatabaseConfigModule { }