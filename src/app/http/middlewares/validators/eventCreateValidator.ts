import { body, ValidationChain } from 'express-validator';

export default {
    rules(): ValidationChain[] {
        return [
            body('title')
                .notEmpty()
                .withMessage('Title cannot be empty')
            ,
            body('description')
                .notEmpty()
                .withMessage('Description cannot be empty')
            ,
            body('images')
                .notEmpty()
                .withMessage('Must upload atleast one image')
            ,
        ]
    }
}