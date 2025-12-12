import { useEffect, useState } from "react";
import { getFullTaskDetails } from "../../api/api";

export default function DetailModal({ workInfoId, onClose, onEdit }) {
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const res = await getFullTaskDetails(workInfoId);
        if (res.success) {
          setTaskData(res.data);
        } else {
          setError("Failed to load task details.");
        }
      } catch (err) {
        console.error("Task details error:", err);
        setError("Error loading task details.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [workInfoId]);

  if (!taskData) {
    return (
      <div className="modal fade show d-block" style={{ background: "#00000070" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content p-5 text-center">
            {loading ? "Loading..." : error}
            <button className="btn btn-secondary mt-3" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { taskInfo, details, targets } = taskData;
  const target = targets?.[0] || {};

  const renderAttachmentLinks = (csv) => {
    if (!csv) return <span className="text-muted">No files</span>;

    const files = csv.split(",").filter(Boolean);
    return (
      <ul className="list-group small">
        {files.map((f) => (
          <li key={f} className="list-group-item py-1">
            <a href={`/uploads/${f}`} target="_blank" rel="noopener noreferrer">
              {f}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="modal fade show d-block" style={{ background: "#00000070" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header bg-light">
            <h5 className="modal-title">Task Details</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">

            {/* Basic Info */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3 text-primary">Basic Information</h6>

              <div className="mb-2">
                <strong>Short Description:</strong>
                <div>{taskInfo.varShortDescription}</div>
              </div>

              <div className="mb-2">
                <strong>Long Description:</strong>
                <div>{taskInfo.varLongDescription || "-"}</div>
              </div>

              <div className="row mt-3">
                <div className="col-md-6">
                  <strong>Assigned To:</strong>
                  <div>User {taskInfo.intUserId}</div>
                </div>

                <div className="col-md-6">
                  <strong>Work Type:</strong>
                  <div>{taskInfo.workTypeName || "-"}</div>
                </div>
              </div>
            </div>

            <hr />

            {/* Target Info */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3 text-primary">Target Information</h6>

              <div className="row">
                <div className="col-md-6">
                  <strong>Status:</strong>
                  <div>{target.statusName || "-"}</div>
                </div>

                <div className="col-md-6">
                  <strong>Target Date:</strong>
                  <div>{target.dttTargetDate || "-"}</div>
                </div>
              </div>

              <div className="mt-3">
                <strong>Comments:</strong>
                <div>{target.Comments || "-"}</div>
              </div>
            </div>

            <hr />

            {/* Attachments */}
            <div>
              <h6 className="fw-bold mb-3 text-primary">Attachments</h6>

              <div className="mb-3">
                <strong>Reference Images:</strong>
                {renderAttachmentLinks(details.varReferenceImageId)}
              </div>

              <div>
                <strong>MOM Files:</strong>
                {renderAttachmentLinks(details.varMOMId)}
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>

            <button
              className="btn btn-primary"
              onClick={() => onEdit(taskData)}
            >
              Edit Task
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
