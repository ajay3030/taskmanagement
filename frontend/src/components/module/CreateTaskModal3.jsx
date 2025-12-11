// src/components/taskList/CreateTaskModal.jsx
import { useEffect, useState } from "react";
import { getMasterDetails, createWorkInfoDetailTarget } from "../../api/api";

export default function CreateTaskModal({ moduleId, onClose, onSuccess, editData = null }) {
  const isEdit = Boolean(editData);

  // ---------------- FORM STATE ---------------- //
  const [form, setForm] = useState({
    varShortDescription: editData?.varShortDescription || "",
    varLongDescription: editData?.varLongDescription || "",
    intWorkTypeId: editData?.intWorkTypeId || "",
    intUserId: editData?.intUserId || 1,
  });

  const [targetForm, setTargetForm] = useState({
    dttTargetDate: editData?.targets?.[0]?.dttTargetDate || "",
    intStatusId: editData?.targets?.[0]?.intStatusId || "",
    Comments: editData?.targets?.[0]?.Comments || "",
    intChangeStatusId: editData?.targets?.[0]?.intChangeStatusId || null,  // stays null on create
  });

  // ---------------- MASTER DATA ---------------- //
  const [workTypes, setWorkTypes] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [changeStatusList, setChangeStatusList] = useState([]);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const wt = await getMasterDetails(1, 6); // Work Types
        const st = await getMasterDetails(1, 9); // Status
        const cs = await getMasterDetails(1, 10); // Change Status

        setWorkTypes(wt.data || []);
        setStatusList(st.data || []);
        setChangeStatusList(cs.data || []);

      } catch (err) {
        console.error("Master load error:", err);
      }
    };

    loadMasters();
  }, []);

  // ---------------- HANDLERS ---------------- //
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const val = ["intWorkTypeId", "intUserId"].includes(name) ? Number(value) : value;

    setForm({ ...form, [name]: val });
  };

  const handleTargetChange = (e) => {
    const { name, value } = e.target;
    const val = ["intStatusId", "intChangeStatusId"].includes(name)
      ? (value ? Number(value) : null)
      : value;

    setTargetForm({ ...targetForm, [name]: val });
  };

  // ---------------- SUBMIT ---------------- //
  const handleSubmit = async () => {
    if (!form.varShortDescription.trim()) {
      alert("Short description is required");
      return;
    }
    if (!form.intWorkTypeId) {
      alert("Please select Work Type");
      return;
    }

    // Build final payload EXACTLY as backend expects
    const payload = {
      intModuleId: moduleId,
      intWorkTypeId: form.intWorkTypeId,
      intDependencyWorkId: null,
      varShortDescription: form.varShortDescription,
      varLongDescription: form.varLongDescription,
      intCreatedBy: 1,
      intUserId: form.intUserId,

      details: {
        intPlatformId: null,
        intPriorityId: null,
        varDetails: null,
        varReferenceImageId: null,
        varMOMId: null
      },

      targets: [
        {
          dttTargetDate: targetForm.dttTargetDate || null,
          intStatusId: targetForm.intStatusId || null,
          Comments: targetForm.Comments || null,
          intChangeStatusId: targetForm.intChangeStatusId || null,
        }
      ]
    };

    try {
      const res = await createWorkInfoDetailTarget(payload);

      if (res.success) {
        alert(isEdit ? "Task updated successfully!" : "Task created successfully!");
        onSuccess();
      } else {
        alert("Operation failed.");
      }
    } catch (err) {
      console.error("Error creating/updating task:", err);
      alert("Something went wrong.");
    }
  };

  // ---------------- JSX RETURN ---------------- //
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "#00000070" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? "Edit Task" : "Create Task"}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">

            {/* Short Description */}
            <div className="mb-3">
              <label className="form-label">Short Description</label>
              <input
                type="text"
                className="form-control"
                name="varShortDescription"
                value={form.varShortDescription}
                onChange={handleFormChange}
              />
            </div>

            {/* Long Description */}
            <div className="mb-3">
              <label className="form-label">Long Description</label>
              <textarea
                className="form-control"
                name="varLongDescription"
                value={form.varLongDescription}
                rows="3"
                onChange={handleFormChange}
              />
            </div>

            {/* Work Type */}
            <div className="mb-3">
              <label className="form-label">Work Type</label>
              <select
                className="form-select"
                name="intWorkTypeId"
                value={form.intWorkTypeId}
                onChange={handleFormChange}
              >
                <option value="">-- Select Work Type --</option>
                {workTypes.map((wt) => (
                  <option key={wt.intId} value={wt.intId}>
                    {wt.varName}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign User */}
            <div className="mb-3">
              <label className="form-label">Assign To (User)</label>
              <select
                className="form-select"
                name="intUserId"
                value={form.intUserId}
                onChange={handleFormChange}
              >
                <option value={1}>User 1</option>
                <option value={2}>User 2</option>
              </select>
            </div>

            {/* --- TARGET SECTION --- */}

            {/* Target Date */}
            <div className="mb-3">
              <label className="form-label">Target Date</label>
              <input
                type="datetime-local"
                className="form-control"
                name="dttTargetDate"
                value={targetForm.dttTargetDate}
                onChange={handleTargetChange}
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="intStatusId"
                value={targetForm.intStatusId}
                onChange={handleTargetChange}
              >
                <option value="">-- Select Status --</option>
                {statusList.map((st) => (
                  <option key={st.intId} value={st.intId}>{st.varName}</option>
                ))}
              </select>
            </div>

            {/* Change Status */}
            <div className="mb-3">
              <label className="form-label">Change Status</label>
              <select
                className="form-select"
                name="intChangeStatusId"
                value={targetForm.intChangeStatusId || ""}
                onChange={handleTargetChange}
                disabled={!isEdit}   // Disabled for create — enabled for edit
              >
                <option value="">-- No Option --</option>
                {changeStatusList.map((cs) => (
                  <option key={cs.intId} value={cs.intId}>{cs.varName}</option>
                ))}
              </select>
            </div>

            {/* Comments */}
            <div className="mb-3">
              <label className="form-label">Comments</label>
              <textarea
                className="form-control"
                name="Comments"
                value={targetForm.Comments}
                rows="2"
                onChange={handleTargetChange}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="viewpro-btn3" onClick={handleSubmit}>
              {isEdit ? "Update Task" : "Save Task"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
