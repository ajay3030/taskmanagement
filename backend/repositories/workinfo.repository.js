const db = require('../config/db');

exports.createWorkInfo = async (params) => {
    const sql = `CALL sp_workinformation_CUD(?,?,?,?,?,?,?,?,?,?,?)`;

    const [
        _intKey, _intId, _intModuleId, _intWorkTypeId,
        _intDependencyWorkId, _varShortDescription,
        _varLongDescription, _intCreatedBy,
        _intActive,_intUserId, _dttCreationDate
    ] = Object.values(params);

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _intModuleId,
        _intWorkTypeId,
        _intDependencyWorkId,
        _varShortDescription,
        _varLongDescription,
        _intCreatedBy,
        _intActive,
        _intUserId,
        _dttCreationDate
    ]);

    return rows[0][0];
};


exports.getWorkList = async (filters) => {
    const sql = `CALL sp_work_list_R(?,?,?,?,?,?,?)`;

    const params = [
        filters.projectId,
        filters.moduleId,
        filters.priorityId,
        filters.platformId,
        filters.workTypeId,
        filters.limit,
        filters.offset
    ];

    const [rows] = await db.query(sql, params);

    const result = rows[0].map(r => ({
        ...r,
        images: r.images ? r.images.split(",") : [],
        mom: r.mom ? r.mom.split(",") : []
    }));

    return result;
};

exports.callWorkInfoProcedure = async (params) => {
    const sql = `CALL sp_workinformation_CUD(?,?,?,?,?,?,?,?,?,?,?)`;

    const [
        _intKey,
        _intId,
        _intModuleId,
        _intWorkTypeId,
        _intDependencyWorkId,
        _varShortDescription,
        _varLongDescription,
        _intCreatedBy,
        _intActive,
        _intUserId,
        _dttCreationDate
    ] = Object.values(params);

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _intModuleId,
        _intWorkTypeId,
        _intDependencyWorkId,
        _varShortDescription,
        _varLongDescription,
        _intCreatedBy,
        _intActive,
        _intUserId,
        _dttCreationDate
    ]);

    return rows[0][0];
};