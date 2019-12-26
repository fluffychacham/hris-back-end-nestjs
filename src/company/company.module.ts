import { Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";
import { CompanyEntity } from "./company.entity";

import { AuthMiddleware } from "../user/auth.middleware";
import { UserModule } from "../user/user.module";
import { UserEntity } from "../user/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([CompanyEntity, UserEntity]), UserModule],
    providers: [CompanyService],
    controllers: [CompanyController],
    exports: [CompanyService]
})
export class CompanyModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                { path: "companies", method: RequestMethod.GET }, 
                { path: "company/:id", method: RequestMethod.GET }, 
                { path: "company", method: RequestMethod.POST }, 
                { path: "company/:id", method: RequestMethod.PUT },
                { path: "company/:id", method: RequestMethod.DELETE }
            );
    }
}
