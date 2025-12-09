// src/components/module/AddModuleModal.jsx
import { useEffect, useState } from "react";
import { getMasterDetails } from "../../api/api";
import { createModule } from "../../api/api";

export default function AddModuleModal({ show, onClose, onSuccess, projectId, parentId }) {
  const [nodeTypes, setNodeTypes] = useState([]);
  const [form, setForm] = useState({
    varModuleName: "",
    intNodeType: "",
    intCreatedBy: 1
  });

  // Fetch NodeType master details (masterTypeId = 5)
  useEffect(() => {
    if (!show) return;

    const loadNodeTypes = async () => {
      const res = await getMasterDetails(1, 5); // typeId=1, masterId = NodeType MasterType
      setNodeTypes(res.data || []);
    };

    loadNodeTypes();
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.varModuleName.trim()) return alert("Module name required");
    if (!form.intNodeType) return alert("Select Node Type");

    const payload = {
      intProjectId: Number(projectId),
      intParentId: parentId ? Number(parentId) : null,
      intNodeType: Number(form.intNodeType),
      varModuleName: form.varModuleName,
      intCreatedBy: 1
    };

    const res = await createModule(payload);

    if (res.success) {
      alert("Module created successfully!");
      onSuccess();
    } else {
      alert("Failed to create module");
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "#00000070" }}>
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">
              {parentId ? "Add Submodule" : "Add Top Module"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">

            {/* Module Name */}
            <div className="mb-3">
              <label className="form-label">Module Name</label>
              <input
                type="text"
                className="form-control"
                name="varModuleName"
                value={form.varModuleName}
                onChange={handleChange}
                placeholder="Enter module name"
              />
            </div>

            {/* Node Type Dropdown */}
            <div className="mb-3">
              <label className="form-label">Node Type</label>
              <select
                className="form-select"
                name="intNodeType"
                value={form.intNodeType}
                onChange={handleChange}
              >
                <option value="">-- Select Node Type --</option>
                {nodeTypes.map((nt) => (
                  <option key={nt.intId} value={nt.intId}>
                    {nt.varName}
                  </option>
                ))}
              </select>
            </div>

            {/* Read-only Info */}
            <p className="text-muted small">
              <strong>Project ID:</strong> {projectId} <br />
              <strong>Parent ID:</strong> {parentId ?? "None (Top Level)"}
            </p>

          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="viewpro-btn3" onClick={handleSubmit}>Save</button>
          </div>

        </div>
      </div>
    </div>
  );
}
