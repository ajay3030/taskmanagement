const workInfoService = require('../services/workinfo.service');

exports.createWorkInfo = async (req, res) => {
    try {
        const result = await workInfoService.createWorkInfo(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.getWorkList = async (req, res) => {
    try {
        const filters = {
            projectId: req.query.projectId || null,
            moduleId: req.query.moduleId || null,
            priorityId: req.query.priorityId || null,
            platformId: req.query.platformId || null,
            workTypeId: req.query.workTypeId || null,
            limit: parseInt(req.query.limit) || 20,
            page: parseInt(req.query.page) || 1
        };

        filters.offset = (filters.page - 1) * filters.limit;

        const list = await workInfoService.getWorkList(filters);

        res.status(200).json({
            success: true,
            data: list
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.updateWorkInfo = async (req, res) => {
    try {
        const result = await workInfoService.updateWorkInfo(req.params.id, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE
exports.deleteWorkInfo = async (req, res) => {
    try {
        const result = await workInfoService.deleteWorkInfo(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
