const express = require('express');
const router = express.Router();

const workDetailsController = require('../controllers/workdetails.controller');
const { createWorkDetailsValidator,updateWorkDetailsValidator } = require('../validators/workdetails.validator');
const { validate } = require('../middlewares/validate.middleware');

router.post('/create-work-details', createWorkDetailsValidator, validate, workDetailsController.createWorkDetails);
router.put('/update-work-details/:id',updateWorkDetailsValidator,validate, workDetailsController.updateWorkDetails);
router.delete('/delete-work-details/:id', workDetailsController.deleteWorkDetails);

module.exports = router;
