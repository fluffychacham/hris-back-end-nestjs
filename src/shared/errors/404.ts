import { HttpException, HttpStatus } from "@nestjs/common";

export class NotFound {
    public static companyNotFound(data: boolean) {
        if (!data) {
            const errors = { company: "Company not found" };
            throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
        }
    }
    public static employeeNotFound(data: boolean) {
        if (!data) {
            const errors = { employee: "Employee not found" };
            throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
        }
    }
}
