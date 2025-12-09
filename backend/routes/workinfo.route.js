const express = require('express');
const router = express.Router();

const workInfoController = require('../controllers/workinfo.controller');
const { createWorkInfoValidator,updateWorkInformationValidator } = require('../validators/workinfo.validator');
const { validate } = require('../middlewares/validate.middleware');
const { validationResult } = require('express-validator');

router.post('/create-work-info', createWorkInfoValidator, validate, workInfoController.createWorkInfo);
router.get('/get-work-list', workInfoController.getWorkList);
router.put('/update-work-info/:id',updateWorkInformationValidator,validate, workInfoController.updateWorkInfo);
router.delete('/delete-work-info/:id', workInfoController.deleteWorkInfo);

module.exports = router;
