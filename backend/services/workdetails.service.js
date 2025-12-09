const workDetailsRepository = require('../repositories/workdetails.repository');

exports.createWorkDetails = async (data) => {
    const params = {
        _intKey: 1,
        _intId: 0,
        _intWorkId: data.intWorkId,
        _intPlatformId: data.intPlatformId || null,
        _intPriorityId: data.intPriorityId || null,
        _varDetails: data.varDetails || null,
        _varReferenceImageId: data.varReferenceImageId || null,
        _varMOMId: data.varMOMId || null,
    };

    return await workDetailsRepository.createWorkDetails(params);
};

exports.updateWorkDetails = async (id, data) => {
    return await workDetailsRepository.callWorkDetailsProcedure({
        _intKey: 2,
        _intId: id,
        _intWorkId: null,   // not updated
        _intPlatformId: data.intPlatformId,
        _intPriorityId: data.intPriorityId,
        _varDetails: data.varDetails,
        _varReferenceImageId: data.varReferenceImageId || null,
        _varMOMId: data.varMOMId || null
    });
};

// DELETE
exports.deleteWorkDetails = async (id) => {
    return await workDetailsRepository.callWorkDetailsProcedure({
        _intKey: 3,
        _intId: id,
        _intWorkId: null,
        _intPlatformId: null,
        _intPriorityId: null,
        _varDetails: null,
        _varReferenceImageId: null,
        _varMOMId: null
    });
};