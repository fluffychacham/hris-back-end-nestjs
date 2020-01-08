import { HttpException, HttpStatus } from "@nestjs/common";

class Errors {
    public static inputNotValid(data: boolean | undefined, message: {} | undefined) {
        if (data || undefined)
            throw new HttpException({ error: { name: "Input validation failed", message } }, HttpStatus.BAD_REQUEST);
    }

    public static notFound(data: boolean | undefined, message: {} | undefined) {
        if (!data || undefined)
            throw new HttpException({ error: { name: "Not found", message } }, HttpStatus.NOT_FOUND);
    }

    public static notAuthorized(data: boolean | undefined, message: {} | undefined) {
        if (!data || undefined) {
            throw new HttpException({ error: { name: "Unauthorized", message } }, HttpStatus.UNAUTHORIZED);
        }
    }
}

export default Errors;
