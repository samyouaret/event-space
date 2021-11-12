import { body, ValidationChain } from 'express-validator';

export default {
    rules(): ValidationChain[] {
        return [
            body('title')
                .notEmpty()
                .withMessage('Title cannot be empty')
                .trim()
            ,
            body('organizer')
                .notEmpty()
                .withMessage('Organizer cannot be empty')
                .trim()
            ,
            body('description')
                .notEmpty()
                .withMessage('Description cannot be empty')
                .trim()
            ,
            body('type')
                .notEmpty()
                .withMessage('Event type cannot be empty')
                .trim()
            ,
            body('timezone')
                .notEmpty()
                .withMessage('Event type cannot be empty')
                .trim()
            ,
            body('startDate')
                .notEmpty()
                .withMessage('Start date cannot be empty')
                .trim()
                .isDate()
                .withMessage('Start date must be a valid date')
            ,
            body('endDate')
                .notEmpty()
                .withMessage('Start date cannot be empty')
                .trim()
                .isDate()
                .withMessage('Start date must be a valid date')
            ,
        ]
    }
}