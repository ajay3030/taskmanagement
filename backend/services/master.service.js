const masterRepository = require('../repositories/master.repository');

const createMasterType = async (data) => {
    const { varName, intActive, intCreatedBy,intMasterRecord } = data;

    const params = {
        _intKey: 1,
        _intId: 0,
        _varName: varName.toLowerCase(),
        _intActive: intActive,
        _intCreatedBy: intCreatedBy,
        _intMasterRecord:intMasterRecord,
        _dttCreationDate: new Date()
    };

    return await masterRepository.createMasterType(params);
};


const createMasterDetail = async (data) => {
   const { intMasterId, varName, intActive, intCreatedBy,intMasterRecord } = data;

    const params = {
        _intKey: 1,
        _intId: 0,
        _intMasterId: intMasterId,
        _varName: varName,
        _intActive: intActive,
        _intCreatedBy: intCreatedBy,
        _intMasterRecord:intMasterRecord,
        _dttCreationDate: new Date()
    };

    return await masterRepository.createMasterDetail(params);

};

const getMasterDetails = async (params) => {
    return await masterRepository.getMasterDetails(params);
};

const getMasterTypes = async () => {
    return await masterRepository.getMasterTypes();
};

const updateMasterType = async (id, data) => {
    return await masterRepository.callMasterTypeProcedure({
        _intKey: 2,                         // UPDATE
        _intId: id,
        _varName: data.varName,
        _intActive: data.intActive,         // can be 1 or 0
        _intCreatedBy: data.intCreatedBy,   // not used in update but required by SP
        _intMasterRecord: null,             // not updated
        _dttCreationDate: null              // not updated
    });
};

// DELETE master type (soft delete)
const deleteMasterType = async (id) => {
    return await masterRepository.callMasterTypeProcedure({
        _intKey: 3,      // DELETE
        _intId: id,
        _varName: null,
        _intActive: 0,   // backend will set this
        _intCreatedBy: null,
        _intMasterRecord: null,
        _dttCreationDate: null
    });
};

const updateMasterDetail = async (id, data) => {
    return await masterRepository.callMasterDetailProcedure({
        _intKey: 2,                          // UPDATE
        _intId: id,
        _intMasterId: data.intMasterId,
        _varName: data.varName,
        _intActive: data.intActive,          // 1 or 0
        _intCreatedBy: data.intCreatedBy,    // required by SP
        _intMasterRecord: null,              // not updated
        _dttCreationDate: null
    });
};

// DELETE
const deleteMasterDetail = async (id) => {
    return await masterRepository.callMasterDetailProcedure({
        _intKey: 3,                          // DELETE
        _intId: id,
        _intMasterId: null,
        _varName: null,
        _intActive: 0,
        _intCreatedBy: null,
        _intMasterRecord: null,
        _dttCreationDate: null
    });
};

module.exports = {createMasterType,createMasterDetail,getMasterDetails,getMasterTypes,deleteMasterType,updateMasterType,updateMasterDetail,deleteMasterDetail}