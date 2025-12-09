const { body } = require('express-validator');

exports.createModuleValidator = [
    body('intProjectId')
        .notEmpty().withMessage('Project ID is required')
        .isInt({ gt: 0 }).withMessage('Project ID must be a positive integer'),

    body('intNodeType')
        .notEmpty().withMessage('Node Type is required')
        .isInt({ gt: 0 }).withMessage('Node Type must be a positive integer'),

    body('varModuleName')
        .notEmpty().withMessage('Module name is required')
        .isString().withMessage('Module name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Module name must be between 2 and 100 characters'),

    body('intCreatedBy')
        .notEmpty().withMessage('CreatedBy is required')
        .isInt({ gt: 0 }).withMessage('CreatedBy must be a positive integer'),

    // body('intParentId')
    //     .optional()
    //     .isInt({ gt: 0 }).withMessage('Parent ID must be a positive integer'),
];


exports.updateModuleValidator = [
    body("varModuleName")
        .notEmpty()
        .withMessage("Module name is required.")
        .isString()
        .withMessage("Module name must be a string.")
        .trim(),

    body("intProjectId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("ProjectId must be a valid integer."),

    body("intNodeType")
        .optional()
        .isInt({ min: 1 })
        .withMessage("NodeType must be a valid integer."),

    body("intParentId")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null) return true;
            if (!Number.isInteger(value)) {
                throw new Error("ParentId must be a valid integer or null.");
            }
            return true;
        }),

    body("intActive")
        .optional()
        .isIn([0, 1])
        .withMessage("intActive must be either 0 or 1.")
];