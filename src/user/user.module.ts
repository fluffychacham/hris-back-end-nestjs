import { MiddlewareConsumer, Module, NestModule, RequestMethod, HttpService, HttpModule } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

import { AuthMiddleware } from './auth.middleware';
import { CompanyModule } from "../company/company.module";
import { CompanyEntity } from "../company/company.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CompanyEntity]), CompanyModule, HttpModule],
  providers: [UserService],
  controllers: [
    UserController
  ],
  exports: [UserService]
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(AuthMiddleware)
        .forRoutes(
          { path: "user", method: RequestMethod.GET }, 
          { path: "user", method: RequestMethod.PUT },
          { path: "user/:id", method: RequestMethod.DELETE },
        );
  }
}
