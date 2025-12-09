const masterService = require('../services/master.service');

const createMasterType = async (req, res, next) => {
    try {
        const master = await masterService.createMasterType(req.body);
        res.status(201).json({ success: true, data: master });
    } catch (err) {
        next(err); // send to global error handler
    }
};

const createMasterDetail = async (req, res, next) => {
    try {
        const master = await masterService.createMasterDetail(req.body);
        res.status(201).json({ success: true, data: master });
    } catch (err) {
        next(err); // send to global error handler
    }
};

const getMasterDetails = async (req, res, next) => {
    try {
        const { typeId, masterId, masterIds } = req.query;

        const params = {
            _intTypeId: Number(typeId),
            _intMasterId: masterId ? Number(masterId) : null,
            _strMasterIds: masterIds || null
        };

        const result = await masterService.getMasterDetails(params);

        res.json({ success: true, data: result });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }

};

const getMasterTypes = async (req, res) => {
    try {
        const result = await masterService.getMasterTypes();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateMasterType = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        const result = await masterService.updateMasterType(id, body);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const deleteMasterType = async (req, res) => {
    try {
        const id = req.params.id;

        const result = await masterService.deleteMasterType(id);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


const updateMasterDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        const result = await masterService.updateMasterDetail(id, body);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE
const deleteMasterDetail = async (req, res) => {
    try {
        const id = req.params.id;

        const result = await masterService.deleteMasterDetail(id);

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {createMasterType,createMasterDetail,getMasterDetails,getMasterTypes,updateMasterType,deleteMasterType,updateMasterDetail,deleteMasterDetail}