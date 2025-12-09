// src/components/module/ModuleTree.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CreateTaskModal from "./CreateTaskModal"
import { getModuleTree } from "../../api/api";

function TreeNode({ node, setShowAssignModal }) {
  const [open, setOpen] = useState(false);


  const hasChildren = node.children && node.children.length > 0;

  return (
    <li className="list-group-item">
      <div className="d-flex justify-content-between align-items-center">

        {/* LEFT SIDE: Toggle + Name */}
        <div className="d-flex align-items-center gap-2">

          {/* Toggle Button (only if children exist) */}
          {hasChildren && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setOpen(!open)}
            >
              {open ? "–" : "+"}
            </button>
          )}

          {/* Module Name */}
          <span>{node.varModuleName ?? node.varName}</span>
        </div>

        {/* RIGHT SIDE: Module ID */}
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">ID: {node.intId}</small>
          <button
            className="btn btn-warning btn-sm mx-auto"
            onClick={() => {
              setShowAssignModal({ open: true, moduleId: node.intId });
            }}
          >
            Assign
          </button>
        </div>
      </div>

      {/* CHILDREN (Only visible when open) */}
      {open && hasChildren && (
        <ul className="list-group mt-2 ms-4">
          {node.children.map((c) => (
            <TreeNode key={c.intId} node={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ModuleTree() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("projectId");

  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState({ open: false, moduleId: null });


useEffect(() => {
  if (!projectId) return;
  setLoading(true);

  getModuleTree(projectId)
    .then(setTree)
    .catch((err) => {
      console.error("Tree fetch error:", err);
      setTree([]);
    })
    .finally(() => setLoading(false));
}, [projectId]);


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Module Tree {projectId ? `for Project ${projectId}` : ""}</h4>
        <div>
          <button className="viewpro-btn3 me-2" onClick={() => navigate("/module-list")}>Back to List</button>
          <button className="viewpro-btn3" onClick={() => navigate("/module-add")}>Add Module</button>
        </div>
      </div>

      <div className="card custom-card bd">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : tree.length === 0 ? (
            <div>No modules found for this project.</div>
          ) : (
            <ul className="list-group">
              {tree.map((node) => (
                <TreeNode key={node.intId} node={node} setShowAssignModal={setAssignModal} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {assignModal.open && (
        <CreateTaskModal
          moduleId={assignModal.moduleId}
          onClose={() => setAssignModal({ open: false, moduleId: null })}
          onSuccess={() => setAssignModal({ open: false, moduleId: null })}
        />
      )}


    </div>
  );
}
