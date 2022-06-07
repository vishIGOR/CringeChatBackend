import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseConfigModule } from "./database/database.module";
import { DatabaseConfigService } from "./database/database.config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [DatabaseConfigService],
      useFactory: async (configService: DatabaseConfigService) => configService.getMongoConfig()
    }),
    DatabaseConfigModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
