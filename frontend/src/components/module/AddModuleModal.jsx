// src/components/module/AddModuleModal.jsx
import { useState } from "react";
import { createModule } from "../../api/api";

// Assuming the intNodeType ID for 'module' is 1, based on previous step
const HARDCODED_NODE_TYPE_ID = 1;

export default function AddModuleModal({ show, onClose, onSuccess, projectId, parentId }) {
 const [form, setForm] = useState({
  varModuleName: "",
  intNodeType: HARDCODED_NODE_TYPE_ID, // Node Type ID fixed and set
  intCreatedBy: 1
 });

 // Removed: useEffect for fetching node types

 const handleChange = (e) => {
  const { name, value } = e.target;
    // Only handles varModuleName input changes
  setForm({ ...form, [name]: value });
 };

 const handleSubmit = async () => {
  // Validation: check for Module Name
  if (!form.varModuleName.trim()) return alert("Module name required");

  const payload = {
   intProjectId: Number(projectId),
   intParentId: parentId ? Number(parentId) : null,
   // Using the hardcoded Node Type ID
   intNodeType: HARDCODED_NODE_TYPE_ID, 
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

      {/* Module Name Input */}
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

      {/* Removed: Node Type dropdown/display section entirely */}

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