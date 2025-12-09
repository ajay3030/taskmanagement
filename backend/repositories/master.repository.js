const db = require('../config/db'); // your mysql connection

const createMasterType = async (params) => {
    const {
        _intKey,
        _intId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    } = params;

    const sql = `CALL sp_mastertype_CU(?, ?, ?, ?, ?, ?,?)`;

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    ]);

    return rows[0][0];  // returns intId

};

const createMasterDetail = async (params) => {
    const {
        _intKey,
        _intId,
        _intMasterId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    } = params;

    const query = `CALL sp_masterdetails_CU(?, ?, ?, ?, ?, ?, ?,?)`;

    const [rows] = await db.query(query, [
        _intKey,
        _intId,
        _intMasterId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    ]);

    return rows[0][0];

};

const getMasterDetails = async (params) => {
    const { _intTypeId, _intMasterId, _strMasterIds } = params;

    const query = "CALL sp_masterdetails_R(?, ?, ?)";

    const [rows] = await db.query(query, [
        _intTypeId,
        _intMasterId,
        _strMasterIds
    ]);

    return rows[0];
};


const getMasterTypes = async () => {
    const [rows] = await db.query("CALL sp_mastertype_R()");
    return rows[0];  // First result set
};

const callMasterTypeProcedure = async (params) => {
    const sql = `CALL sp_mastertype_CUD(?,?,?,?,?,?,?)`;

    const [
        _intKey,
        _intId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    ] = Object.values(params);

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    ]);

    return rows[0][0];  // return { intId: ... }
};

const callMasterDetailProcedure = async (params) => {
    const sql = `CALL sp_masterdetails_CUD(?,?,?,?,?,?,?,?)`;

    const [
        _intKey,
        _intId,
        _intMasterId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    ] = Object.values(params);

    const [rows] = await db.query(sql, [
        _intKey,
        _intId,
        _intMasterId,
        _varName,
        _intActive,
        _intCreatedBy,
        _intMasterRecord,
        _dttCreationDate
    ]);

    return rows[0][0]; // returns { intId: ... }
};

module.exports = {createMasterType,createMasterDetail,getMasterDetails,getMasterTypes,callMasterTypeProcedure,callMasterDetailProcedure}