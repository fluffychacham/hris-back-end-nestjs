import { NestModule, MiddlewareConsumer, RequestMethod, Module } from "@nestjs/common";
import { AuthMiddleware } from "../user/auth.middleware";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeEntity } from "./employee.entity";
import { UserEntity } from "../user/user.entity";
import { UserModule } from "../user/user.module";
import { CompanyEntity } from "../company/company.entity";
import { EmployeeService } from "./employee.service";
import { EmployeeController } from "./employee.comtroller";

@Module({
    imports: [TypeOrmModule.forFeature([EmployeeEntity, CompanyEntity, UserEntity]), UserModule],
    providers: [EmployeeService],
    controllers: [EmployeeController],
    exports: [EmployeeService]
})
export class EmployeeModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                { path: "company/:companyId/employee/:id", method: RequestMethod.GET },
                { path: "company/:companyId/employee", method: RequestMethod.POST },
                { path: "company/:companyId/employee/:id", method: RequestMethod.PUT },
                { path: "company/:companyId/employee/:id", method: RequestMethod.DELETE }
            );
    }
}
