// src/components/module/ModuleList.jsx
import { useEffect, useState } from "react";
import { getMasterDetails, getModuleTree } from "../../api/api";
import AddModuleModal from "./AddModuleModal";
import CreateTaskModal from "./CreateTaskModal"; // <--- use the create-task modal
import { useNavigate } from "react-router-dom";

function TreeNode({ node, onAddSubmodule, onAssign }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <li className="list-group-item">
      <div className="d-flex justify-content-between align-items-center">

        {/* LEFT SIDE */}
        <div className="d-flex align-items-center gap-2">
          {hasChildren && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setOpen(!open)}
            >
              {open ? "–" : "+"}
            </button>
          )}

          <span>{node.varModuleName}</span>
        </div>

        {/* RIGHT SIDE ICON BUTTONS */}
        <div className="d-flex gap-2">
          {/* Assign icon */}
          <button
            className="btn btn-sm btn-outline-primary"
            title="Assign Task"
            onClick={() => onAssign(node.intId)}
          >
            <i className="bi bi-person-plus"></i>
          </button>

          {/* Add Submodule icon */}
          <button
            className="btn btn-sm btn-outline-success"
            title="Add Submodule"
            onClick={() => onAddSubmodule(node.intId)}
          >
            <i className="bi bi-node-plus"></i>
          </button>
        </div>
      </div>

      {/* CHILDREN */}
      {open && hasChildren && (
        <ul className="list-group mt-2 ms-4">
          {node.children.map((c) => (
            <TreeNode
              key={c.intId}
              node={c}
              onAddSubmodule={onAddSubmodule}
              onAssign={onAssign}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ModuleList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tree, setTree] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [parentId, setParentId] = useState(null);
  const [assignModuleId, setAssignModuleId] = useState(null);

  // Load projects (masterTypeId for project assumed 4)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await getMasterDetails(1, 4);
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    loadProjects();
  }, []);

  // Load tree when project changes
  const loadTree = async (projectId) => {
    if (!projectId) {
      setTree([]);
      return;
    }
    try {
      const tree = await getModuleTree(projectId);
      setTree(tree);
    } catch (err) {
      console.error("Failed to load tree", err);
      setTree([]);
    }
  };

  const handleProjectChange = (val) => {
    setSelectedProjectId(val);
    setTree([]);
    if (val) loadTree(val);
  };

  const openAddModule = (parent = null) => {
    setParentId(parent);
    setShowAddModal(true);
  };

  const openAssignModal = (moduleId) => {
    setAssignModuleId(moduleId);
    setShowAssignModal(true);
  };

  return (
    <div className="container mt-4">

      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Module Management</h3>

        <div className="d-flex gap-2">
          {/* Home Button */}
          <button
            className="viewpro-btn3"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-house-door"></i> Home
          </button>

          {/* Add Top Module Button */}
          {selectedProjectId && (
            <button
              className="viewpro-btn3"
              onClick={() => openAddModule(null)}
            >
              <i className="bi bi-plus-lg"></i> Add Top Module
            </button>
          )}
        </div>
      </div>

      {/* PROJECT SELECTION CARD */}
      <div className="card p-3 mb-3">
        <div className="row align-items-center">

          {/* Project Dropdown */}
          <div className="col-md-4">
            <label className="form-label mb-1">Select Project</label>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">-- Choose Project --</option>
              {projects.map((p) => (
                <option key={p.intId} value={p.intId}>
                  {p.varName}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* TREE VIEW SECTION */}
      {selectedProjectId && (
        <div className="card custom-card bd">
          <div className="card-header">
            <h5 className="mb-0">Module Structure</h5>
          </div>

          <div className="card-body">
            {tree.length === 0 ? (
              <p className="text-muted">No modules found for this project.</p>
            ) : (
              <ul className="list-group">
                {tree.map((node) => (
                  <TreeNode
                    key={node.intId}
                    node={node}
                    onAddSubmodule={openAddModule}
                    onAssign={openAssignModal}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ADD MODULE MODAL */}
      <AddModuleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadTree(selectedProjectId);
        }}
        projectId={selectedProjectId}
        parentId={parentId}
      />

      {/* ASSIGN TASK MODAL */}
      {showAssignModal && (
        <CreateTaskModal
          moduleId={assignModuleId}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => setShowAssignModal(false)}
        />
      )}

    </div>

  );
}
