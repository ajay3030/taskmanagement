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

// example for insertOrUpdateWorkInfo
exports.insertOrUpdateWorkInfo = async (conn, params) => {
  const sql = `CALL sp_workinformation_CUD(?,?,?,?,?,?,?,?,?,?,?)`;

  const procParams = [
    params._intKey,
    params._intId,
    params._intModuleId,
    params._intWorkTypeId,
    params._intDependencyWorkId,
    params._varShortDescription,
    params._varLongDescription,
    params._intCreatedBy,
    params._intActive,
    params._intUserId,
    params._dttCreationDate
  ];

  const [res] = await conn.query(sql, procParams);
  return res[0][0];
};

// exports.insertOrUpdateWorkDetails = async (conn, params) => {
//   const sql = `CALL sp_workinformationdetails_CUD(?,?,?,?,?,?,?,?)`;

//   const procParams = [
//     params._intKey,
//     params._intId,
//     params._intWorkId,
//     params._intPlatformId,
//     params._intPriorityId,
//     params._varDetails,
//     params._varReferenceImageId,
//     params._varMOMId
//   ];

//   const [res] = await conn.query(sql, procParams);
//   return res[0][0];
// };


exports.insertOrUpdateWorkTarget = async (conn, params) => {
  const sql = `CALL sp_workinformationtargets_CUD(?,?,?,?,?,?,?)`;

  const procParams = [
    params._intKey,                    // required
    params._intId,                     // required
    params._intWorkId,
    params._dttTargetDate,
    params._intStatusId,
    params._Comments,
    params._intChangeStatusId
  ];

  const [res] = await conn.query(sql, procParams);
  return res[0][0];
};


exports.insertOrUpdateWorkDetails = async (conn, params) => {
  const sql = `CALL sp_workinformationdetails_CUD(?,?,?,?,?,?,?,?)`;

  const procParams = [
    params._intKey,                  // 1, 2, 3, OR NOW 4 (UPSERT)
    params._intId,                   // always 0 for upsert
    params._intWorkId,
    params._intPlatformId,
    params._intPriorityId,
    params._varDetails,
    params._varReferenceImageId,
    params._varMOMId
  ];

  const [res] = await conn.query(sql, procParams);
  return res[0][0]; // always returns { intId: ... }
};


exports.getFullWorkInfoDetails = async (workId) => {
  const sql = `CALL sp_workinfo_full_details_R(?);`;
  const [resultSets] = await db.query(sql, [workId]);

  // resultSets = [taskInfoRows, detailsRows, targetRows, extraMeta]

  const taskInfo = resultSets[0]?.[0] || null;
  const details = resultSets[1]?.[0] || null;
  const targets = resultSets[2] || [];

  return { taskInfo, details, targets };
};


exports.updateWorkInfo = async (conn, params) => {
  const sql = `CALL sp_workinformation_CUD(?,?,?,?,?,?,?,?,?,?,?)`;

  const procParams = [
    2,                         // _intKey = 2 (update)
    params.workInfoId,        // _intId
    params.intModuleId,
    params.intWorkTypeId,
    params.intDependencyWorkId,
    params.varShortDescription,
    params.varLongDescription,
    params.intCreatedBy,
    1,                        // intActive stays 1
    params.intUserId,
    new Date()                // dttCreationDate remains unchanged—ignored on update
  ];

  const [res] = await conn.query(sql, procParams);
  return res[0][0];
};

exports.upsertWorkDetails = async (conn, params) => {
  const sql = `CALL sp_workinformationdetails_CUD(?,?,?,?,?,?,?,?)`;

  const procParams = [
    params.intDetailsId ? 2 : 1,   // update if ID exists, else insert
    params.intDetailsId || 0,
    params.workInfoId,
    params.intPlatformId,
    params.intPriorityId,
    params.varDetails,
    params.varReferenceImageId,
    params.varMOMId
  ];

  const [res] = await conn.query(sql, procParams);
  return res[0][0];
};

exports.upsertWorkTarget = async (conn, params) => {
  const sql = `CALL sp_workinformationtargets_CUD(?,?,?,?,?,?,?)`;

  const procParams = [
    params.targetId ? 2 : 1,           // update if exists
    params.targetId || 0,
    params.workInfoId,
    params.dttTargetDate,
    params.intStatusId,
    params.Comments,
    params.intChangeStatusId
  ];

  const [res] = await conn.query(sql, procParams);
  return res[0][0];
};


