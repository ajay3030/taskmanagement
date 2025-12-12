const workInfoRepository = require('../repositories/workinfo.repository');
const db = require("../config/db");
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

exports.getFullDetails = async (workId) => {
  if (!workId) throw new Error("workInfoId is required");

  const result = await workInfoRepository.getFullWorkInfoDetails(workId);

  if (!result.taskInfo) {
    throw new Error("Task not found");
  }

  return {
    taskInfo: result.taskInfo,
    details: result.details || {
      intPlatformId: null,
      intPriorityId: null,
      varDetails: null,
      varReferenceImageId: null,
      varMOMId: null
    },
    targets: result.targets
  };
};

exports.createWorkInfoDetailTarget = async (payload) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Insert workinformation via SP
    const workParams = {
      _intKey: 1,
      _intId: 0,
      _intModuleId: payload.intModuleId || null,
      _intWorkTypeId: payload.intWorkTypeId || null,
      _intDependencyWorkId: payload.intDependencyWorkId || null,
      _varShortDescription: payload.varShortDescription || null,
      _varLongDescription: payload.varLongDescription || null,
      _intCreatedBy: payload.intCreatedBy || null,
      _intActive: 1,
      _intUserId: payload.intUserId || null,
      _dttCreationDate: new Date()
    };

    const workRow = await workInfoRepository.insertOrUpdateWorkInfo(conn, workParams);
    const workId = workRow.intId;
    if (!workId) throw new Error("Failed inserting workinformation.");

    // 2) Insert Details (optional)
    let detailsResult = null;
    if (payload.details) {
      const d = payload.details;
      const detailParams = {
        _intKey: 1,
        _intId: 0,
        _intWorkId: workId,
        _intPlatformId: d.intPlatformId || null,
        _intPriorityId: d.intPriorityId || null,
        _varDetails: d.varDetails || null,
        _varReferenceImageId: d.varReferenceImageId || null,
        _varMOMId: d.varMOMId || null
      };

      detailsResult = await workInfoRepository.insertOrUpdateWorkDetails(conn, detailParams);
      if (!detailsResult.intId) throw new Error("Failed inserting work details.");
    }

    // 3) Insert Targets (0..n)
    const targetsAdded = [];

    if (Array.isArray(payload.targets)) {
      for (const t of payload.targets) {
        const targetParams = {
          _intKey: 1,
          _intId: 0,
          _intWorkId: workId,
          _dttTargetDate: t.dttTargetDate || null,
          _intStatusId: t.intStatusId || null,
          _Comments: t.Comments || null,
          _intChangeStatusId: t.intChangeStatusId || null
        };

        const targetInsert = await workInfoRepository.insertOrUpdateWorkTarget(conn, targetParams);
        if (!targetInsert.intId) throw new Error("Failed inserting work target.");

        targetsAdded.push(targetInsert);
      }
    }

    await conn.commit();

    return {
      workId,
      detailsId: detailsResult ? detailsResult.intId : null,
      targets: targetsAdded
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.updateWorkInfoDetailTarget = async (payload) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const workInfoId = payload.workInfoId;
    if (!workInfoId) throw new Error("workInfoId is required.");

    // 1) UPDATE workinformation
    const workParams = {
      _intKey: 2,
      _intId: workInfoId,
      _intModuleId: payload.intModuleId,
      _intWorkTypeId: payload.intWorkTypeId,
      _intDependencyWorkId: payload.intDependencyWorkId || null,
      _varShortDescription: payload.varShortDescription,
      _varLongDescription: payload.varLongDescription,
      _intCreatedBy: payload.intCreatedBy,
      _intActive: 1,
      _intUserId: payload.intUserId || null,
      _dttCreationDate: null
    };

    const updatedWork = await workInfoRepository.insertOrUpdateWorkInfo(conn, workParams);
    if (!updatedWork) throw new Error("Failed to update work information.");

    // 2) UPSERT details using _intKey = 4
    const details = payload.details;
    let detailsResult = null;

    if (details) {
      const detailParams = {
        _intKey: 4,    // UPSERT BY WORKINFOID
        _intId: 0,
        _intWorkId: workInfoId,
        _intPlatformId: details.intPlatformId || null,
        _intPriorityId: details.intPriorityId || null,
        _varDetails: details.varDetails || null,
        _varReferenceImageId: details.varReferenceImageId || null,
        _varMOMId: details.varMOMId || null
      };

      detailsResult = await workInfoRepository.insertOrUpdateWorkDetails(conn, detailParams);
    }

    // 3) UPDATE/INSERT targets
    const updatedTargets = [];
    for (const t of payload.targets || []) {
      const targetParams = {
        _intKey: t.targetId ? 2 : 1,
        _intId: t.targetId || 0,
        _intWorkId: workInfoId,
        _dttTargetDate: t.dttTargetDate || null,
        _intStatusId: t.intStatusId || null,
        _Comments: t.Comments || null,
        _intChangeStatusId: t.intChangeStatusId || null
      };

      const result = await workInfoRepository.insertOrUpdateWorkTarget(conn, targetParams);
      updatedTargets.push(result);
    }

    await conn.commit();

    return {
      success: true,
      message: "Task updated successfully",
      workInfoId,
      detailsId: detailsResult ? detailsResult.intId : null,
      targets: updatedTargets
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


// exports.updateWorkInfoDetailTarget = async (payload) => {
//   const conn = await db.getConnection();
//   try {
//     await conn.beginTransaction();

//     const workInfoId = payload.workInfoId;
//     if (!workInfoId) throw new Error("workInfoId is required");

//     // ----------------------------------------
//     // 1) UPDATE workinformation
//     // ----------------------------------------
//     await workInfoRepository.updateWorkInfo(conn, {
//       workInfoId,
//       intModuleId: payload.intModuleId,
//       intWorkTypeId: payload.intWorkTypeId,
//       intDependencyWorkId: payload.intDependencyWorkId || null,
//       varShortDescription: payload.varShortDescription,
//       varLongDescription: payload.varLongDescription,
//       intCreatedBy: payload.intCreatedBy,
//       intUserId: payload.intUserId
//     });

//     // ----------------------------------------
//     // 2) UPSERT workinformationdetails
//     // ----------------------------------------
//     if (payload.details) {
//       await workInfoRepository.upsertWorkDetails(conn, {
//         intDetailsId: payload.details.intDetailsId || null,
//         workInfoId,
//         intPlatformId: payload.details.intPlatformId,
//         intPriorityId: payload.details.intPriorityId,
//         varDetails: payload.details.varDetails,
//         varReferenceImageId: payload.details.varReferenceImageId,
//         varMOMId: payload.details.varMOMId
//       });
//     }

//     // ----------------------------------------
//     // 3) UPSERT target (0 or 1 entry)
//     // ----------------------------------------
//     if (Array.isArray(payload.targets) && payload.targets.length > 0) {
//       const t = payload.targets[0];
//       await workInfoRepository.upsertWorkTarget(conn, {
//         targetId: t.targetId || null,
//         workInfoId,
//         dttTargetDate: t.dttTargetDate,
//         intStatusId: t.intStatusId,
//         Comments: t.Comments,
//         intChangeStatusId: t.intChangeStatusId
//       });
//     }

//     await conn.commit();

//     return {
//       success: true,
//       message: "Task updated successfully."
//     };
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// };