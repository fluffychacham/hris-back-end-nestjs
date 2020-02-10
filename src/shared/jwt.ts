const jwt = require('jsonwebtoken');
import { SECRET } from '../config';
import { GenericUser } from './user.type';

export const generateJWT = (user: GenericUser) => {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: user.id,
        email: user.email,
        exp: exp.getTime() / 1000,
    }, SECRET);
};