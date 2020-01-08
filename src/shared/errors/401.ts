import { HttpException, HttpStatus } from "@nestjs/common";

export class Unauthorized {
    public static NotAuthorized(data: boolean) {
        if (!data) throw new HttpException("Not authorized", HttpStatus.UNAUTHORIZED);
    }
    public static UserNotFound(data: boolean) {
        if (!data) throw new HttpException("User not found", HttpStatus.UNAUTHORIZED);
    }
}
