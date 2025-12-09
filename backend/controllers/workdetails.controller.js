const workDetailsService = require('../services/workdetails.service');

exports.createWorkDetails = async (req, res) => {
    try {
        const result = await workDetailsService.createWorkDetails(req.body);
        res.status(201).json({ success: true, data: result });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateWorkDetails = async (req, res) => {
    try {
        const result = await workDetailsService.updateWorkDetails(req.params.id, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE
exports.deleteWorkDetails = async (req, res) => {
    try {
        const result = await workDetailsService.deleteWorkDetails(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};