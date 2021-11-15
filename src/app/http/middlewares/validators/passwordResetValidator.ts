import { body, ValidationChain } from 'express-validator';

export default {
    rules(): ValidationChain[] {
        return [
            body('password')
                .bail()
                .isStrongPassword()
                .withMessage('password length should be at least 8,contain characters, Capitals, numbers and at least 1 symbol .')
        ]
    }
}