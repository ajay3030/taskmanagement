const db = require('../config/db'); // your mysql connection

const createModule = async (params) => {
    const {
        _intKey,
        _intId,
        _intProjectId,
        _intNodeType,
        _varModuleName,
        _intCreatedBy,
        _intActive,
        _intParentId
    } = params;

    const sql = `CALL sp_modules_CUD(?, ?, ?, ?, ?, ?, ?, ?)`;

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _intProjectId,
        _intNodeType,
        _varModuleName,
        _intCreatedBy,
        _intActive,
        _intParentId
    ]);

    return rows[0][0];

};

const getModules = async (projectId) => {
    const [rows] = await db.query("CALL sp_modules_R(?)", [projectId]);
    return rows[0];
};

const callModuleProcedure = async (params) => {
  const sql = `CALL sp_modules_CUD(?,?,?,?,?,?,?,?)`;

  const [
    _intKey,
    _intId,
    _intProjectId,
    _intNodeType,
    _varModuleName,
    _intCreatedBy,
    _intActive,
    _intParentId
  ] = [
    params._intKey,
    params._intId,
    params._intProjectId,
    params._intNodeType,
    params._varModuleName,
    params._intCreatedBy,
    params._intActive,
    params._intParentId
  ];

  const [rows] = await db.query(sql, [
    _intKey,
    _intId,
    _intProjectId,
    _intNodeType,
    _varModuleName,
    _intCreatedBy,
    _intActive,
    _intParentId,
    _intUserId
  ]);

  // procedure returns SELECT _intId AS intId;
  return rows[0][0];
};

const getModuleSummary = async (projectId) => {
  const [rows] = await db.query('CALL sp_module_summary(?)', [projectId]);
  // rows[0] is the result set returned by the stored procedure
  const result = (rows[0] || []).map(r => ({
    moduleId: r.moduleId,
    moduleName: r.moduleName,
    parentId: r.parentId === null ? null : r.parentId,
    createdById: r.createdById ?? null,
    createdByName: r.createdByName ?? null,
    assignedTo: r.assignedTo === null ? null : r.assignedTo,
    assignedToName: r.assignedToName || null,
    workInfoId: r.workInfoId || null,
    status: r.statusName || null,
    statusId: r.statusId || null,
    workTypeId: r.workTypeId || null,
    workTypeName: r.workTypeName || null
  }));

  return result;
};

module.exports = {createModule,getModules,callModuleProcedure,getModuleSummary}