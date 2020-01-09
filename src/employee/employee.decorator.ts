import { createParamDecorator } from "@nestjs/common";
import { SECRET } from "../config";
import * as jwt from "jsonwebtoken";

export const Employee = createParamDecorator((data, req) => {
    if (!!req.employee) {
        return !!data ? req.employee[data] : req.employee;
    }

    const token = req.headers.authorization ? (req.headers.authorization as string).split(" ") : null;
    if (token && token[1]) {
        const decoded: any = jwt.verify(token[1], SECRET);
        return !!data ? decoded[data] : decoded.employee;
    }
});
