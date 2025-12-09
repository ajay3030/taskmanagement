const { body,check } = require('express-validator');

exports.createWorkDetailsValidator = [
    body('intWorkId')
        .notEmpty().withMessage('WorkId is required')
        .isInt({ gt: 0 }).withMessage('WorkId must be a positive integer'),

    body('intPlatformId')
        .optional()
        .isInt({ gt: 0 }).withMessage('PlatformId must be a positive integer'),

    body('intPriorityId')
        .optional()
        .isInt({ gt: 0 }).withMessage('PriorityId must be a positive integer'),

    body('varDetails')
        .optional()
        .isString().withMessage('Details must be a string'),

    body('varReferenceImageId')
        .optional()
        .isString().withMessage('ReferenceImageId must be string'),

    body('varMOMId')
        .optional()
        .isString().withMessage('MOMId must be string')
];


exports.updateWorkDetailsValidator = [
    check("intPlatformId")
        .notEmpty().withMessage("intPlatformId is required")
        .isInt().withMessage("intPlatformId must be an integer"),

    check("intPriorityId")
        .notEmpty().withMessage("intPriorityId is required")
        .isInt().withMessage("intPriorityId must be an integer"),

    check("varDetails")
        .optional()
        .isString().withMessage("varDetails must be a string"),

    check("varReferenceImageId") 
        .optional() 
        .isString().withMessage("varReferenceImageId must be a string"),

    check("varMOMId") 
        .optional() 
        .isString().withMessage("varMOMId must be a string")
];
