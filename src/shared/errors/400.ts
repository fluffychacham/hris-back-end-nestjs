import { HttpException, HttpStatus } from "@nestjs/common";

export class BadRequest {
    public static CompanyExists(data: boolean) {
        if (data) {
            const errors = { company: "Company already exists" };
            throw new HttpException({ message: "Input validation failed", errors }, HttpStatus.BAD_REQUEST);
        }
    }
    public static CompanyNotValid(data: boolean) {
        if (data) {
            const errors = { company: "Company is not valid" };
            throw new HttpException({ message: "Input validation failed", errors }, HttpStatus.BAD_REQUEST);
        }
    }
    public static EmployeeExists(data: boolean) {
        if (data) {
            const errors = { employee: "Employee first and last name already exists" };
            throw new HttpException({ message: "Input validation failed", errors }, HttpStatus.BAD_REQUEST);
        }
    }
    public static EmployeeNotValid(data: boolean) {
        if (data) {
            const errors = { employee: "Employee not valid" };
            throw new HttpException({ message: "Input validation failed", errors }, HttpStatus.BAD_REQUEST);
        }
    }
}
