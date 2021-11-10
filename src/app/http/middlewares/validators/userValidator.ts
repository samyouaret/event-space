import { body, ValidationChain } from 'express-validator';

export default {
    rules(): ValidationChain[] {
        return [
            body('email')
                .notEmpty()
                .withMessage('Email cannot be empty')
                .bail()
                .isEmail()
                .normalizeEmail()
                .withMessage('Invalid email given')
            ,
            body('password')
                .bail()
                .isStrongPassword()
                .withMessage('password length should be at least 8,contain characters, Capitals, numbers and at least 1 symbol .')
            ,
            body('firstName')
                .notEmpty()
                .withMessage('FirstName cannot be empty')
            ,
            body('lastName')
                .notEmpty()
                .withMessage('LastName cannot be empty')
            ,
        ]
    }
}