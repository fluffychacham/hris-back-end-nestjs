import { HttpException, HttpStatus } from "@nestjs/common";

export class IErrors {
    error: {
        name: string,
        message: Object
    }
}
class Errors {
    private datas: boolean[] = [];
    private messages: Object[] = [];
    private status: HttpStatus;

    constructor(status: HttpStatus) {
        this.status = status;
    }

    private static ErrorException(exception: IErrors, status: HttpStatus): HttpException | undefined {
        throw new HttpException(exception, status);
    }

    public static inputNotValid(dataNotValid: boolean | undefined, message: {} | undefined) {
        if (dataNotValid || undefined)
            this.ErrorException({ error: { name: "Input validation failed", message } }, HttpStatus.BAD_REQUEST);
    }

    public static notFound(dataNotFound: boolean | undefined, message: {} | undefined) {
        if (!dataNotFound || undefined) 
            this.ErrorException({ error: { name: "Not found", message } }, HttpStatus.NOT_FOUND);
    }

    public static notAuthorized(dataNotAuthorized: boolean | undefined, message: {} | undefined) {
        if (!dataNotAuthorized || undefined) {
            this.ErrorException({ error: { name: "Unauthorized", message } }, HttpStatus.UNAUTHORIZED);
        }
    }

    public pushErrorMessage(data: boolean | undefined, message: {} | undefined) {
        this.datas.push(data);
        this.messages.push(message);
    }

    public showErrorMessages() {
        let message = {};
        this.datas.map((d, i) => {
            if(d) message = {...message, ...this.messages[i]}
        })
        switch(this.status){
            case HttpStatus.BAD_REQUEST:
                Errors.inputNotValid(true, message);
                break;
            case HttpStatus.NOT_FOUND:
                Errors.notFound(true, message);
                break;
            case HttpStatus.UNAUTHORIZED:
                Errors.notAuthorized(true, message);
                break;
            default:
        }
    }
}

export default Errors;
