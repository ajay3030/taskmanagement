const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/module.controller');
const {createModuleValidator,updateModuleValidator} = require('../validators/module.validator')
const {validate} = require('../middlewares/validate.middleware')


router.post('/insert-module',createModuleValidator,validate,moduleController.createModule);
router.get('/get-modules', moduleController.getModules);
router.put('/update-module/:id',updateModuleValidator,validate, moduleController.updateModule);     // Update
router.delete('/delete-module/:id', moduleController.deleteModule);  // Soft delete (cascade)
router.get('/module-summary', moduleController.getModuleSummary);



module.exports = router;
