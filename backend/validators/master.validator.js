const { body,param } = require('express-validator');

exports.createMasterTypeValidator = [
    body('varName')
        .notEmpty().withMessage('varName is required')
        .isString().withMessage('varName must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('varName must be 2 to 100 characters'),

    body('intActive')
        .notEmpty().withMessage('intActive is required')
        .isInt({ min: 0, max: 1 }).withMessage('intActive must be 0 or 1'),

    body('intCreatedBy')
        .notEmpty().withMessage('intCreatedBy is required')
        .isInt({ gt: 0 }).withMessage('intCreatedBy must be a positive integer')
];


exports.createMasterDetailValidator = [
    body('intMasterId')
        .notEmpty().withMessage('intMasterId is required')
        .isInt({ gt: 0 }).withMessage('intMasterId must be a positive integer'),

    body('varName')
        .notEmpty().withMessage('varName is required')
        .isString().withMessage('varName must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('varName must be 2 to 100 characters'),

    body('intActive')
        .notEmpty().withMessage('intActive is required')
        .isInt({ min: 0, max: 1 }).withMessage('intActive must be 0 or 1'),

    body('intCreatedBy')
        .notEmpty().withMessage('intCreatedBy is required')
        .isInt({ gt: 0 }).withMessage('intCreatedBy must be a positive integer')
];

exports.updateMasterTypeValidator = [
    // varName is required & must be string
    body("varName")
        .trim()
        .notEmpty().withMessage("varName is required")
        .isString().withMessage("varName must be a string")
        .isLength({ max: 100 }).withMessage("varName cannot exceed 100 chars"),

    // intActive must be 0 or 1
    body("intActive")
        .notEmpty().withMessage("intActive is required")
        .isInt({ min: 0, max: 1 }).withMessage("intActive must be 0 or 1"),

    // intCreatedBy must be an integer
    body("intCreatedBy")
        .notEmpty().withMessage("intCreatedBy is required")
        .isInt({ min: 1 }).withMessage("intCreatedBy must be a valid user id"),
];


exports.updateMasterDetailValidator = [
    
    // Validate ID in params
    param("id")
        .isInt({ min: 1 })
        .withMessage("intId (param) must be a valid integer"),

    // MasterId cannot change — but must exist in DB as integer
    body("intMasterId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("intMasterId must be a valid integer"),

    // varName is required for update
    body("varName")
        .notEmpty()
        .withMessage("varName is required")
        .isString()
        .withMessage("varName must be a string")
        .trim(),

    // intActive must be 0 or 1
    body("intActive")
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage("intActive must be 0 or 1"),

    // createdBy is optional but if provided must be an integer
    body("intCreatedBy")
        .optional()
        .isInt({ min: 1 })
        .withMessage("intCreatedBy must be a valid integer"),

];