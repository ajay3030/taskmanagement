// src/components/taskList/CreateTaskModal.jsx
import { useEffect, useState } from "react";
import { getMasterDetails,createWorkInfo } from "../../api/api";

export default function CreateTaskModal({ moduleId, onClose, onSuccess }) {
  const [workTypes, setWorkTypes] = useState([]);

  const [form, setForm] = useState({
    varShortDescription: "",
    varLongDescription: "",
    intWorkTypeId: "",
    intUserId: 1,
    intDependencyWorkId: null, // always null (hidden)
  });

  // Load Work Types (masterTypeId = 6)
  useEffect(() => {
    const loadWorkTypes = async () => {
      try {
        const res = await getMasterDetails(1, 6); // WorkType masterTypeId = 6
        setWorkTypes(res.data || []);
      } catch (err) {
        console.error("Error fetching Work Types:", err);
      }
    };

    loadWorkTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // convert numeric fields to number
    const finalValue =
      name === "intWorkTypeId" || name === "intUserId"
        ? Number(value)
        : value;

    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async () => {
    if (!form.varShortDescription.trim()) {
      alert("Short description is required");
      return;
    }
    if (!form.intWorkTypeId) {
      alert("Please select Work Type");
      return;
    }

    const payload = {
      intModuleId: moduleId,
      intWorkTypeId: form.intWorkTypeId,
      intDependencyWorkId: null,
      varShortDescription: form.varShortDescription,
      varLongDescription: form.varLongDescription,
      intCreatedBy: 1,
      intUserId: form.intUserId,
    };

    try {
      const { success } = await createWorkInfo(payload);

      if (success) {
        alert("Task created successfully!");
        onSuccess();
      } else {
        alert("Failed to create task.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "#00000070" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Create Task</h5>
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
                onChange={handleChange}
                placeholder="Enter short description"
              />
            </div>

            {/* Long Description */}
            <div className="mb-3">
              <label className="form-label">Long Description</label>
              <textarea
                className="form-control"
                name="varLongDescription"
                value={form.varLongDescription}
                onChange={handleChange}
                rows="3"
                placeholder="Enter long description"
              ></textarea>
            </div>

            {/* Work Type */}
            <div className="mb-3">
              <label className="form-label">Work Type</label>
              <select
                className="form-select"
                name="intWorkTypeId"
                value={form.intWorkTypeId}
                onChange={handleChange}
              >
                <option value="">-- Select Work Type --</option>
                {workTypes.map((wt) => (
                  <option key={wt.intId} value={wt.intId}>
                    {wt.varName}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign To (User ID) */}
            <div className="mb-3">
              <label className="form-label">Assign To (User)</label>
              <select
                className="form-select"
                name="intUserId"
                value={form.intUserId}
                onChange={handleChange}
              >
                <option value={1}>User 1</option>
                <option value={2}>User 2</option>
              </select>
            </div>

          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="viewpro-btn3" onClick={handleSubmit}>
              Save Task
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
