import { TestingModule, Test } from "@nestjs/testing";
import * as request from "supertest";
import { CompanyController } from "../company/company.controller";
import { CompanyEntity } from "../company/company.entity";
import { CompanyService } from "./company.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getConnectionOptions } from "typeorm";
import { INestApplication } from "@nestjs/common";
import { UserEntity } from "../user/user.entity";

describe("Company Controller", () => {
    let companyService: CompanyService;
    let companyController: CompanyController;
    let app: INestApplication;

    const companies: CompanyEntity[] = [];
    const createCompany = (id, name, domain, description, ownerId) => {
        const company = new CompanyEntity();
        company.id = id;
        company.name = name;
        company.domain = domain;
        company.description = description;
        company.owner = ownerId;
        return company;
    };

    companies.push(createCompany(1, "jido", "jido.ca", "jido description", 1));
    companies.push(createCompany(2, "lido", "lido.ca", "jido description", 1));
    companies.push(createCompany(3, "mido", "mido.ca", "jido description", 1));

    beforeAll(async () => {
        const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({ ...connectionOptions, name: "default" }),
                TypeOrmModule.forFeature([CompanyEntity, UserEntity])
            ],
            controllers: [CompanyController],
            providers: [CompanyService]
        }).compile();

        companyService = module.get<CompanyService>(CompanyService);
        companyController = module.get<CompanyController>(CompanyController);

        app = module.createNestApplication();
        app.init();
    });

    describe("create", () => {
        it("should create a company", async () => {
            const response = await request(app.getHttpServer());
            console.log(response.get("/api/companies").body);
        });
    });

    describe("findById", () => {
        it("should return a CompanyRO", async () => {
            const companyRO = { company: companies[1] };
            jest.spyOn(companyService, "findById").mockImplementation(() => Promise.resolve(companyRO));
            const findAllResult = await companyController.findById(1, 1);
            expect(findAllResult.company.name).toEqual("lido");
        });
    });
});
