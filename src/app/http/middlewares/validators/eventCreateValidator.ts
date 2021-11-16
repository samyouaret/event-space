import { body, ValidationChain } from 'express-validator';

export default {
    rules(): ValidationChain[] {
        return [
            body('title')
                .notEmpty()
                .withMessage('Title cannot be empty')
                .trim(),
            body('organizer')
                .notEmpty()
                .withMessage('Organizer cannot be empty')
                .trim()
            ,
            body('description')
                .optional()
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
                .optional()
                .notEmpty()
                .withMessage('Start date cannot be empty')
                .trim()
                // .withMessage('Start date must be a valid date')
            ,
            body('endDate')
                .optional()
                .notEmpty()
                .withMessage('End date cannot be empty')
                .trim()
                // .withMessage('End date must be a valid date')
            ,
        ]
    }
}