import { HttpException, HttpStatus } from "@nestjs/common";

class Errors {
    public static inputNotValid(data: boolean | undefined, errorMessage: {} | undefined) {
        if (data || undefined)
            throw new HttpException({ message: "Input validation failed", errorMessage }, HttpStatus.BAD_REQUEST);
    }

    public static notFound(data: boolean | undefined, errorMessage: {} | undefined) {
        if (!data || undefined) throw new HttpException({ message: "Not found", errorMessage }, HttpStatus.NOT_FOUND);
    }

    public static notAuthorized(data: boolean | undefined, errorMessage: {} | undefined) {
        if (!data || undefined) {
            throw new HttpException({ message: "Unauthorized", errorMessage }, HttpStatus.UNAUTHORIZED);
        }
    }
}

export default Errors;
