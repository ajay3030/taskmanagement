import { useState } from "react";

export default function AssignModal({ task, onClose, onSuccess }) {
  const [userId, setUserId] = useState("");

  const handleSave = async () => {
    if (!userId.trim()) {
      alert("Please enter a User ID");
      return;
    }

    // Backend requires FULL object update
    const payload = {
      intModuleId: task.moduleId,
      intWorkTypeId: task.workTypeId,
      intDependencyWorkId: task.dependencyWorkId ?? null,
      varShortDescription: task.shortDescription,
      varLongDescription: task.longDescription,
      intUserId: Number(userId)
    };

    try {
      const res = await fetch(
        `http://localhost:4000/api/workinfo/update-work-info/${task.workId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      console.log("Assign User Response:", data);

      if (!data.success) throw new Error("Assignment failed");

      alert("User assigned successfully!");
      onSuccess();
    } catch (err) {
      console.error("Assign error:", err);
      alert("Failed to assign user.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000
      }}
    >
      <div className="card p-3" style={{ width: "380px" }}>
        <h5 className="mb-3">Assign User</h5>

        <div className="mb-3">
          <label>User ID</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>
            Cancel
          </button>

          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
