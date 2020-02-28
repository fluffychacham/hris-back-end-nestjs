import { NestMiddleware, Injectable } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { SECRET } from "../config";
import { EmployeeService } from "./employee.service";
import Errors from "../shared/Errors";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly employeeService: EmployeeService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeaders = req.headers.authorization;
        if (authHeaders && (authHeaders as string).split(" ")[1]) {
            const token = (authHeaders as string).split(" ")[1];
            const decoded: any = jwt.verify(token, SECRET);
            const employee = await this.employeeService.findByEmail(decoded.email);

            Errors.notAuthorized(!!employee, { employee: "Employee not authorized" });

            req.employee = employee.employee;
            req.employee.id = decoded.id;
            next();
        } else {
            Errors.notAuthorized(true, { employee: "Employee not authorized" });
        }
    }
}
