const workInfoRepository = require('../repositories/workinfo.repository');

exports.createWorkInfo = async (data) => {
    const params = {
        _intKey: 1,
        _intId: 0,
        _intModuleId: data.intModuleId,
        _intWorkTypeId: data.intWorkTypeId,
        _intDependencyWorkId: data.intDependencyWorkId || null,
        _varShortDescription: data.varShortDescription,
        _varLongDescription: data.varLongDescription,
        _intCreatedBy: data.intCreatedBy,
        _intActive: 1,
        _intUserId : data.intUserId,
        _dttCreationDate: new Date()
    };

    return await workInfoRepository.createWorkInfo(params);
};


exports.getWorkList = async (filters) => {
    return await workInfoRepository.getWorkList(filters);
};

exports.updateWorkInfo = async (id, data) => {
    return await workInfoRepository.callWorkInfoProcedure({
        _intKey: 2,
        _intId: id,
        _intModuleId: data.intModuleId,
        _intWorkTypeId: data.intWorkTypeId,
        _intDependencyWorkId: data.intDependencyWorkId,
        _varShortDescription: data.varShortDescription,
        _varLongDescription: data.varLongDescription,
        _intCreatedBy: null,
        _intActive: null,
        _intUserId : data.intUserId,
        _dttCreationDate: null
    });
};

// DELETE (soft delete + cascade)
exports.deleteWorkInfo = async (id) => {
    return await workInfoRepository.callWorkInfoProcedure({
        _intKey: 3,
        _intId: id,
        _intModuleId: null,
        _intWorkTypeId: null,
        _intDependencyWorkId: null,
        _varShortDescription: null,
        _varLongDescription: null,
        _intCreatedBy: null,
        _intActive: 0,
        _dttCreationDate: null
    });
};