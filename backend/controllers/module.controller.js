const moduleService = require('../services/module.service');

const createModule = async (req, res, next) => {
    try {
        const module = await moduleService.createModule(req.body);
        res.status(201).json({ success: true, data: module });
    } catch (err) {
        next(err); // send to global error handler
    }
};

const getModules = async (req, res) => {
    try {
        const { projectId, mode } = req.query;

        if (!projectId) {
            return res.status(400).json({ success: false, message: "projectId is required" });
        }

        const result = await moduleService.getModules(projectId, mode || "list");

        res.json({ success: true, data: result });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateModule = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await moduleService.updateModule(id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await moduleService.deleteModule(id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


const getModuleSummary = async (req, res) => {
  try {
    const projectId = Number(req.query.projectId);
    if (!projectId || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId is required and must be > 0' });
    }

    const rows = await moduleService.getModuleSummary(projectId);

    res.json({ success: true, data: rows });
  } catch (err) {
    // log the error (logger) and return 500
    console.error('getModuleSummary error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {createModule,getModules,updateModule,deleteModule,getModuleSummary}