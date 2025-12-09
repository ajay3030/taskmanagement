const express = require('express');
const router = express.Router();

const masterController = require('../controllers/master.controller');
const {createMasterTypeValidator , createMasterDetailValidator,updateMasterTypeValidator , updateMasterDetailValidator} = require('../validators/master.validator')
const {validate} = require('../middlewares/validate.middleware')

//master type endpoints
router.post('/insert-master-type',createMasterTypeValidator,validate,masterController.createMasterType);
router.get('/get-master-types',masterController.getMasterTypes);
router.put('/update-master-type/:id',updateMasterTypeValidator,validate, masterController.updateMasterType);
router.delete('/delete-master-type/:id', masterController.deleteMasterType);

//master detail endpoints
router.post('/insert-master-detail',createMasterDetailValidator,validate,masterController.createMasterDetail);
router.get('/get-master-details',masterController.getMasterDetails);
router.put('/update-master-detail/:id',updateMasterDetailValidator,validate, masterController.updateMasterDetail);
router.delete('/delete-master-detail/:id', masterController.deleteMasterDetail);






module.exports = router;
