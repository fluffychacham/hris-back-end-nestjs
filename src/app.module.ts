<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ArticleModule } from "./article/article.module";
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "typeorm";
import { ProfileModule } from "./profile/profile.module";
import { TagModule } from "./tag/tag.module";
import { CompanyModule } from "./company/company.module";
import { EmployeeModule } from "./employee/employee.module";

@Module({
    imports: [
        TypeOrmModule.forRoot(),
        ArticleModule,
        UserModule,
        ProfileModule,
        TagModule,
        CompanyModule,
        EmployeeModule
    ],
    controllers: [AppController],
    providers: []
=======
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    ProfileModule,
    TagModule,
    CompanyModule,
    EmployeeModule
  ],
  controllers: [
    AppController
  ],
  providers: []
>>>>>>> 635d760783eac8ac3563eb56146f0849ac448b72
})
export class ApplicationModule {
    constructor(private readonly connection: Connection) {}
}
