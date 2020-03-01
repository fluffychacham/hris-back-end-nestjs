import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint, ValidationOptions, registerDecorator } from "class-validator";

@ValidatorConstraint({ name: 'emailValidator', async: true })
class EmailValidationConstraint implements ValidatorConstraintInterface {
    public validate(text: string, args: ValidationArguments) {
        return /^\w{3,20}([\.-]?\w+)*@\w{2,20}([\.-]?\w+)*(\.\w{2,3})+$/.test(text);
    }

    public defaultMessage(args: ValidationArguments) {
        return "Email is not valid";
    }
}

export default EmailValidationConstraint;

export function IsEmailValid(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string){
        registerDecorator({
            name: 'isEmailValid',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: EmailValidationConstraint
        })
    }
}