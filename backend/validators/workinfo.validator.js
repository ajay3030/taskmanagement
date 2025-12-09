const { body } = require('express-validator');

exports.createWorkInfoValidator = [
    body('intModuleId')
        .notEmpty().withMessage('ModuleId is required')
        .isInt({ gt: 0 }).withMessage('ModuleId must be a positive integer'),

    body('intWorkTypeId')
        .notEmpty().withMessage('WorkTypeId is required')
        .isInt({ gt: 0 }).withMessage('WorkTypeId must be a positive integer'),

    body('varShortDescription')
        .notEmpty().withMessage('Short description is required')
        .isLength({ min: 2, max: 100 }).withMessage('Short description must be 2–100 chars'),

    body('varLongDescription')
        .notEmpty().withMessage('Long description is required'),

    body('intCreatedBy')
        .notEmpty().withMessage('CreatedBy is required')
        .isInt({ gt: 0 }).withMessage('CreatedBy must be a positive integer'),

    body('intDependencyWorkId')
        .optional()
        .custom(v => v === '' || v == null || (Number.isInteger(+v) && +v > 0))
        .withMessage('DependencyWorkId must be positive integer')
];

exports.updateWorkInformationValidator = [
    
    body("intModuleId")
        .notEmpty().withMessage("Module ID is required")
        .isInt({ gt: 0 }).withMessage("Module ID must be a valid integer"),

    body("intWorkTypeId")
        .notEmpty().withMessage("Work Type ID is required")
        .isInt({ gt: 0 }).withMessage("Work Type ID must be a valid integer"),

    body("intDependencyWorkId")
        .optional({ nullable: true })
        .isInt({ gt: 0 }).withMessage("Dependency Work ID must be a valid integer"),

    body("varShortDescription")
        .trim()
        .notEmpty().withMessage("Short description is required")
        .isLength({ min: 3 }).withMessage("Short description must be at least 3 characters"),

    body("varLongDescription")
        .trim()
        .notEmpty().withMessage("Long description is required")
        .isLength({ min: 5 }).withMessage("Long description must be at least 5 characters"),

];
