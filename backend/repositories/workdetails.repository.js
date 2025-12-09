const db = require('../config/db');

exports.createWorkDetails = async (params) => {
    const sql = `CALL sp_workinformationdetails_CU(?,?,?,?,?,?,?,?)`;

    const [
        _intKey, _intId, _intWorkId, _intPlatformId,
        _intPriorityId, _varDetails,
        _varReferenceImageId, _varMOMId
    ] = Object.values(params);

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _intWorkId,
        _intPlatformId,
        _intPriorityId,
        _varDetails,
        _varReferenceImageId,
        _varMOMId
    ]);

    return rows[0][0];
};

exports.callWorkDetailsProcedure = async (params) => {
    const sql = `CALL sp_workinformationdetails_CUD(?,?,?,?,?,?,?,?)`;

    const [
        _intKey,
        _intId,
        _intWorkId,
        _intPlatformId,
        _intPriorityId,
        _varDetails,
        _varReferenceImageId,
        _varMOMId
    ] = Object.values(params);

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _intWorkId,
        _intPlatformId,
        _intPriorityId,
        _varDetails,
        _varReferenceImageId,
        _varMOMId
    ]);

    return rows[0][0];
};